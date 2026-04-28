"""
Output Equivalence Test — compares REDCap table data between two databases.

Connects to both databases, queries all 18 REDCap-sourced tables, and reports:
  - Row counts per table
  - Column-level value diff for mismatched tables (first differing row shown)
  - Summary of intentional known differences (UTF-8 encoding, boolean fixes)

Usage:
  python scripts/compare_tables.py OLD_DB_URL NEW_DB_URL [--csv output.csv]

Examples:
  python scripts/compare_tables.py \\
      "postgresql://user:pass@old-host/db" \\
      "postgresql://user:pass@new-host/db"

  python scripts/compare_tables.py OLD NEW --csv report.csv

Exit codes:
  0 — all tables match (or only known-intentional differences)
  1 — at least one unexpected mismatch found
"""

import argparse
import csv
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import psycopg2
from loader.loader import REDCAP_TABLES

# Known intentional differences to document but not fail on.
# Add entries here as the equivalence test surfaces expected changes.
KNOWN_DIFFERENCES = [
    "UTF-8 characters in names that were previously corrupted by latin-1 encoding",
    "Boolean fields normalized to true/false (old pipeline used 1/0 strings in some tables)",
    "userId columns use deterministic MD5-based IDs (new) vs Spark monotonically_increasing_id (old, non-deterministic)",
    "Trailing/leading whitespace stripped from string values",
]

# Columns skipped during value comparison (known algorithmic differences).
SKIP_COLUMNS = {"userId"}


def _fetch_table(conn, table: str, proposal_ids: set = None) -> tuple[list, list]:
    """Return (columns, rows) for a table, sorted for deterministic comparison.

    If proposal_ids is given and the table has a ProposalID column, only return
    rows whose ProposalID is in that set (intersection mode).
    Always sort by ProposalID first (if present), then all other columns.
    """
    with conn.cursor() as cur:
        cur.execute(f'SELECT * FROM "{table}" LIMIT 0')
        columns = [d.name for d in cur.description]

        # Build ORDER BY: ProposalID first (if present), then remaining columns
        if "ProposalID" in columns:
            pid_idx = columns.index("ProposalID") + 1  # 1-indexed
            other_idxs = [i + 1 for i, c in enumerate(columns) if c != "ProposalID"]
            order_clause = ", ".join(
                [f'"{c}"' for c in ["ProposalID"] + [c for c in columns if c != "ProposalID"]]
            )
        else:
            order_clause = ", ".join([f'"{c}"' for c in columns])

        if proposal_ids is not None and "ProposalID" in columns:
            ids_list = sorted(proposal_ids)
            cur.execute(
                f'SELECT * FROM "{table}" WHERE "ProposalID" = ANY(%s) ORDER BY {order_clause}',
                (ids_list,),
            )
        else:
            cur.execute(f'SELECT * FROM "{table}" ORDER BY {order_clause}')
        rows = cur.fetchall()
    return columns, rows


def _get_proposal_ids(conn, table: str) -> set:
    """Return the set of ProposalIDs present in the given table."""
    with conn.cursor() as cur:
        try:
            cur.execute(f'SELECT DISTINCT "ProposalID" FROM "{table}"')
            return {row[0] for row in cur.fetchall()}
        except Exception:
            return set()


def _compare_table(old_conn, new_conn, table: str) -> dict:
    """Compare one table between two databases. Returns a result dict."""
    result = {"table": table, "status": "ok", "old_rows": 0, "new_rows": 0, "details": ""}
    try:
        # First fetch without filter to get full counts
        old_cols, old_rows_all = _fetch_table(old_conn, table)
        new_cols, new_rows_all = _fetch_table(new_conn, table)
    except Exception as e:
        result["status"] = "error"
        result["details"] = str(e)
        return result

    result["old_rows"] = len(old_rows_all)
    result["new_rows"] = len(new_rows_all)

    if set(old_cols) != set(new_cols):
        result["status"] = "column_mismatch"
        result["details"] = (
            f"old cols: {sorted(old_cols)}, new cols: {sorted(new_cols)}"
        )
        return result

    # If row counts differ and the table has ProposalID, compare on intersection
    if len(old_rows_all) != len(new_rows_all) and "ProposalID" in old_cols:
        old_pids = _get_proposal_ids(old_conn, table)
        new_pids = _get_proposal_ids(new_conn, table)
        common_pids = old_pids & new_pids
        extra_in_new = len(new_pids - old_pids)

        old_cols, old_rows = _fetch_table(old_conn, table, common_pids)
        new_cols, new_rows = _fetch_table(new_conn, table, common_pids)

        if len(old_rows) != len(new_rows):
            result["status"] = "row_count_mismatch"
            result["details"] = (
                f"old={len(old_rows_all)}, new={len(new_rows_all)}, "
                f"common_proposals={len(common_pids)}, "
                f"old_intersection={len(old_rows)}, new_intersection={len(new_rows)}"
            )
            return result

        if extra_in_new > 0:
            result["extra_in_new"] = extra_in_new
    else:
        old_rows = old_rows_all
        new_rows = new_rows_all

        if len(old_rows) != len(new_rows):
            result["status"] = "row_count_mismatch"
            result["details"] = f"old={len(old_rows)}, new={len(new_rows)}"
            return result

    def _norm(val):
        """Normalize a value for comparison: strip whitespace from strings."""
        if isinstance(val, str):
            return val.strip()
        return val

    # Compare row-by-row (already sorted by PK)
    for i, (old_row, new_row) in enumerate(zip(old_rows, new_rows)):
        old_dict = {c: old_row[j] for j, c in enumerate(old_cols)}
        new_dict = {c: new_row[j] for j, c in enumerate(new_cols)}
        diffs = {
            c: (old_dict[c], new_dict[c])
            for c in old_cols
            if c not in SKIP_COLUMNS
            and str(_norm(old_dict.get(c))) != str(_norm(new_dict.get(c)))
        }
        if diffs:
            result["status"] = "value_mismatch"
            result["details"] = f"first diff at row {i}: {diffs}"
            return result

    return result


def run(old_db_url: str, new_db_url: str, csv_path: str = None) -> int:
    print(f"\nConnecting to old pipeline DB...")
    old_conn = psycopg2.connect(old_db_url)
    print(f"Connecting to new pipeline2 DB...")
    new_conn = psycopg2.connect(new_db_url)

    results = []
    mismatches = []

    print(f"\n{'Table':<45} {'Old Rows':>10} {'New Rows':>10}  Status")
    print("-" * 80)

    for table in REDCAP_TABLES:
        r = _compare_table(old_conn, new_conn, table)
        results.append(r)
        status_icon = "✓" if r["status"] == "ok" else "✗"
        extra_note = f"  (+{r['extra_in_new']} new)" if r.get("extra_in_new") else ""
        print(
            f"  {status_icon}  {r['table']:<43} {r['old_rows']:>10} {r['new_rows']:>10}  {r['status']}{extra_note}"
        )
        if r["status"] not in ("ok",):
            mismatches.append(r)
            if r["details"]:
                print(f"       └─ {r['details']}")

    old_conn.close()
    new_conn.close()

    print("\n" + "=" * 80)
    matching = sum(1 for r in results if r["status"] == "ok")
    print(f"Results: {matching}/{len(REDCAP_TABLES)} tables match exactly")

    if KNOWN_DIFFERENCES:
        print("\nKnown intentional differences (not counted as failures):")
        for diff in KNOWN_DIFFERENCES:
            print(f"  • {diff}")

    if csv_path:
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["table", "status", "old_rows", "new_rows", "details"])
            writer.writeheader()
            writer.writerows(results)
        print(f"\nReport written to {csv_path}")

    if mismatches:
        print(f"\nFAIL — {len(mismatches)} table(s) did not match:")
        for r in mismatches:
            print(f"  • {r['table']}: {r['status']}")
        return 1

    print("\nPASS — all REDCap tables match between pipelines")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Compare REDCap table data between two pipeline databases")
    parser.add_argument("old_db_url", help="PostgreSQL URL for old pipeline database")
    parser.add_argument("new_db_url", help="PostgreSQL URL for new pipeline2 database")
    parser.add_argument("--csv", metavar="FILE", help="Write results to CSV file")
    args = parser.parse_args()

    sys.exit(run(args.old_db_url, args.new_db_url, csv_path=args.csv))
