"""
Database loader for the CTMD pipeline.

Two responsibilities:

1. Migration runner: applies pending SQL migration files from the migrations/
   directory in order, tracking applied files in a schema_migrations table.
   Called at startup when CREATE_TABLES=1.

2. Bulk sync (Path A — REDCap-sourced tables only): wraps a full TRUNCATE +
   COPY of the 18 pure REDCap-sourced tables in a single transaction.
   CSV-managed tables are never touched by this operation.

Uses psycopg2.sql.Identifier for all table/column names to prevent SQL
injection. UTF-8 throughout.
"""

import io
import logging
import os
import csv
from glob import glob
from pathlib import Path

import psycopg2
from psycopg2 import sql

logger = logging.getLogger(__name__)

# Tables populated entirely by the REDCap sync.
# These are the only tables TRUNCATED during a sync run.
# Mixed tables (some CSV-managed columns) are excluded to protect user data.
REDCAP_TABLES = [
    # Load order respects FK dependencies: Proposal first, dependents after.
    "Proposal",
    "Submitter",
    "ProposalDetails",
    "ProposalFunding",
    "AssignProposal",
    "InitialConsultationSummary",
    "ProtocolTimelines_estimated",
    "BudgetBreakOut",
    "RecommendationsForPI",
    "FinalRecommendation",
    "CTSA",
    "StudyPI",
    "Proposal_ConsultOptions",
    "Proposal_NewServiceSelection",
    "Proposal_ServicesApproved",
    "Proposal_ServicesPatOutcome",
    "Proposal_ServicesPostOutcome",
    "Proposal_RemovedServices",
]


def connect(database_url: str):
    """Open a psycopg2 connection with UTF-8 encoding."""
    conn = psycopg2.connect(database_url, options="-c client_encoding=UTF8")
    conn.autocommit = False
    return conn


# ---------------------------------------------------------------------------
# Migration runner
# ---------------------------------------------------------------------------

def apply_migrations(conn, migrations_dir: str) -> list:
    """
    Apply all pending SQL migration files in migrations_dir in filename order.
    Tracks applied migrations in a schema_migrations table.

    Returns a list of filenames that were applied in this call.
    """
    _ensure_migrations_table(conn)

    migration_files = sorted(
        Path(p).name for p in glob(os.path.join(migrations_dir, "*.sql"))
    )

    applied = _get_applied_migrations(conn)
    newly_applied = []

    for filename in migration_files:
        if filename in applied:
            logger.info("migration already applied, skipping: %s", filename)
            continue

        filepath = os.path.join(migrations_dir, filename)
        logger.info("applying migration: %s", filename)

        with open(filepath, encoding="utf-8") as f:
            migration_sql = f.read()

        with conn.cursor() as cur:
            cur.execute(migration_sql)
            cur.execute(
                "INSERT INTO schema_migrations (filename) VALUES (%s)",
                (filename,),
            )

        conn.commit()
        newly_applied.append(filename)
        logger.info("migration applied: %s", filename)

    return newly_applied


def _ensure_migrations_table(conn):
    """Create the schema_migrations tracking table if it doesn't exist."""
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                filename   VARCHAR PRIMARY KEY,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """)
    conn.commit()


def _get_applied_migrations(conn) -> set:
    with conn.cursor() as cur:
        cur.execute("SELECT filename FROM schema_migrations")
        return {row[0] for row in cur.fetchall()}


# ---------------------------------------------------------------------------
# Bulk sync (Path A)
# ---------------------------------------------------------------------------

def sync_redcap_tables(conn, table_data: dict) -> dict:
    """
    Atomically replace all REDCap-sourced table data in a single transaction.

    Args:
        conn: psycopg2 connection (autocommit must be False).
        table_data: Dict from transformer.transform_all() —
                    table_name → list[row_dict].

    Returns:
        Dict of table_name → row count loaded.

    If any error occurs the transaction is rolled back and the exception
    is re-raised. The database is never left in an empty state.
    """
    counts = {}
    try:
        with conn.cursor() as cur:
            # Truncate in reverse dependency order to satisfy FK constraints,
            # then reload in forward order.
            for table in reversed(REDCAP_TABLES):
                cur.execute(
                    sql.SQL("TRUNCATE TABLE {} CASCADE").format(
                        sql.Identifier(table)
                    )
                )
                logger.debug("truncated %s", table)

            for table in REDCAP_TABLES:
                rows = table_data.get(table, [])
                if not rows:
                    counts[table] = 0
                    continue
                count = _copy_rows(cur, table, rows)
                counts[table] = count
                logger.info("loaded %s: %d rows", table, count)

        conn.commit()
        logger.info("sync committed — tables: %s", counts)
        return counts

    except Exception:
        conn.rollback()
        logger.exception("sync failed, transaction rolled back")
        raise


def sync_name_table(conn, name_rows: list) -> int:
    """
    Atomically replace the `name` lookup table with fresh data from the
    REDCap data dictionary.

    The `name` table is not part of REDCAP_TABLES (it's populated from the
    data dictionary, not from records), so it's handled separately.

    Returns the number of rows loaded.
    """
    if not name_rows:
        logger.warning("name table: no rows generated — skipping")
        return 0
    try:
        with conn.cursor() as cur:
            cur.execute(sql.SQL("TRUNCATE TABLE {}").format(sql.Identifier("name")))
            count = _copy_rows(cur, "name", name_rows)
            logger.info("loaded name: %d rows", count)
        conn.commit()
        return count
    except Exception:
        conn.rollback()
        logger.exception("name table sync failed, rolled back")
        raise


def _copy_rows(cur, table: str, rows: list) -> int:
    """
    Bulk-load rows into a table using PostgreSQL COPY FROM STDIN.

    Columns are derived from the keys of the first row dict.
    All values are written as CSV to an in-memory buffer.
    """
    if not rows:
        return 0

    columns = list(rows[0].keys())
    col_identifiers = sql.SQL(", ").join(sql.Identifier(c) for c in columns)
    copy_sql = sql.SQL("COPY {} ({}) FROM STDIN WITH (FORMAT CSV, NULL '')").format(
        sql.Identifier(table), col_identifiers
    )

    buf = io.StringIO()
    writer = csv.writer(buf, quoting=csv.QUOTE_MINIMAL)
    for row in rows:
        writer.writerow([row.get(c) for c in columns])
    buf.seek(0)

    cur.copy_expert(copy_sql, buf)
    return len(rows)
