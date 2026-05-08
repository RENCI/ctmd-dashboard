#!/usr/bin/env python3
"""
migrate_csv_tables.py — copy CSV-managed table data from ctmd-db to ctmd-db2.

These tables are populated by user CSV uploads via the dashboard, not by the
REDCap sync. They live in the old ctmd-db and must be migrated to ctmd-db2
before the API can be switched to use ctmd-db2.

Run ONCE as a pre-cutover step with both databases port-forwarded:

  kubectl port-forward svc/ctmd-db  -n ctmd 5433:5432 &
  kubectl port-forward svc/ctmd-db2 -n ctmd 5434:5432 &

  python3 scripts/migrate_csv_tables.py \\
    "postgresql://ctmd-user:PASSWORD@localhost:5433/postgres" \\
    "postgresql://ctmd-user:PASSWORD@localhost:5434/postgres"

Add --dry-run to preview row counts without writing anything.
"""
import sys
import psycopg2
from psycopg2 import sql

# Tables populated by CSV uploads — NOT touched by the REDCap sync.
# These need to be copied from ctmd-db to ctmd-db2 before API cutover.
CSV_TABLES = [
    "Administrator",
    "TINuser",
    "User",
    "Voter",
    "Sites",
    "CTSAs",
    "StudyProfile",
    "StudySites",
    "SiteInformation",
    "StudyInformation",
    "EnrollmentInformation",
    "UtahRecommendation",
    "PATMeeting",
    "PATReviewForVote",
    "TIChealPOCs",
    "InitialConsultationDates",
    "LettersAndSurvey",
    "ConsultationRequest",
    "ServicesAdditionalInfo",
    "SuggestedChanges",
    "TIC_RICAssessment",
    "reviewer_organization",
]


def _redact(url: str) -> str:
    """Hide password in URL for display."""
    try:
        at = url.rindex("@")
        proto_end = url.index("://") + 3
        return url[:proto_end] + "****@" + url[at + 1:]
    except ValueError:
        return url


def migrate(source_url: str, target_url: str, dry_run: bool = False) -> None:
    print(f"Source: {_redact(source_url)}")
    print(f"Target: {_redact(target_url)}")
    if dry_run:
        print("(dry run — no data will be written)")
    print()

    src = psycopg2.connect(source_url)
    dst = psycopg2.connect(target_url)
    src.autocommit = True

    migrated = 0
    skipped = 0
    errors = []

    for table in CSV_TABLES:
        try:
            with src.cursor() as cur:
                cur.execute(
                    sql.SQL("SELECT COUNT(*) FROM {}").format(sql.Identifier(table))
                )
                count = cur.fetchone()[0]

            if count == 0:
                print(f"  {table:<40s}  empty, skipping")
                skipped += 1
                continue

            # Fetch all rows and column names from source
            with src.cursor() as cur:
                cur.execute(
                    sql.SQL("SELECT * FROM {}").format(sql.Identifier(table))
                )
                rows = cur.fetchall()
                cols = [desc[0] for desc in cur.description]

            if dry_run:
                print(f"  {table:<40s}  {count:6d} rows  [dry run]")
                migrated += 1
                continue

            # TRUNCATE target and bulk INSERT
            with dst.cursor() as cur:
                cur.execute(
                    sql.SQL("TRUNCATE TABLE {} RESTART IDENTITY CASCADE").format(
                        sql.Identifier(table)
                    )
                )
                if rows:
                    col_idents = sql.SQL(", ").join(
                        sql.Identifier(c) for c in cols
                    )
                    placeholders = sql.SQL(", ").join(
                        [sql.Placeholder()] * len(cols)
                    )
                    insert = sql.SQL(
                        "INSERT INTO {} ({}) VALUES ({})"
                    ).format(sql.Identifier(table), col_idents, placeholders)
                    cur.executemany(insert, rows)
            dst.commit()
            print(f"  {table:<40s}  {count:6d} rows  ✓")
            migrated += 1

        except Exception as exc:
            dst.rollback()
            msg = f"  {table:<40s}  ERROR: {exc}"
            print(msg)
            errors.append(msg)

    print()
    print(f"Done: {migrated} table(s) migrated, {skipped} empty, {len(errors)} error(s).")
    if errors:
        print("\nErrors:")
        for e in errors:
            print(e)
        sys.exit(1)

    src.close()
    dst.close()


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry_run = "--dry-run" in sys.argv

    if len(args) < 2:
        print(__doc__)
        sys.exit(1)

    migrate(args[0], args[1], dry_run=dry_run)
