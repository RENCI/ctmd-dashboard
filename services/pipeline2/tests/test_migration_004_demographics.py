"""Static guard for migration 004 (EnrollmentDemographics).

The loader test-suite uses a mock DB (no real Postgres), so we can't assert the
migration *applies* here — that's validated at deploy time by apply_migrations
running against a real DB. What we CAN cheaply guard is the migration's declared
schema, so an accidental column drop/rename/typo can't silently break the
CSV-template ↔ table column matching (uploads validate CSV columns against these
exact DB column names).
"""

import os

MIGRATION = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "migrations",
    "004_add_enrollment_demographics.sql",
)

CATEGORIES = ["Hispanic", "NonHispanic", "AIAN", "Asian", "NHPI", "Black", "White"]
SEXES = ["Female", "Male"]
# 28 demographic cells = {planned, actual} x 7 categories x 2 sexes
EXPECTED_CELLS = [
    f"{kind}{cat}{sex}"
    for kind in ("planned", "actual")
    for cat in CATEGORIES
    for sex in SEXES
]
EXPECTED_COLUMNS = ["ProposalID"] + EXPECTED_CELLS  # 1 + 28 = 29


def _sql():
    with open(MIGRATION) as f:
        return f.read()


def test_migration_file_exists():
    assert os.path.exists(MIGRATION), "migration 004 is missing"


def test_creates_table_idempotently():
    sql = _sql()
    assert 'CREATE TABLE IF NOT EXISTS "EnrollmentDemographics"' in sql


def test_declares_all_expected_columns():
    sql = _sql()
    missing = [c for c in EXPECTED_COLUMNS if f'"{c}"' not in sql]
    assert not missing, f"migration 004 is missing columns: {missing}"


def test_has_exactly_29_bigint_columns():
    # ProposalID + 28 demographic cells, all BIGINT — no stray/extra columns.
    assert len(EXPECTED_COLUMNS) == 29
    assert _sql().count(" BIGINT") == 29
