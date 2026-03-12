"""Tests for schema/generator.py."""

import json
import os
import tempfile
import pytest
from schema.generator import generate_sql, _pg_type


MAPPING_PATH = "/data/mapping.json"


# ---------------------------------------------------------------------------
# Unit tests: _pg_type
# ---------------------------------------------------------------------------

class TestPgType:
    def test_text(self):
        assert _pg_type("text") == "VARCHAR"

    def test_text_trailing_space(self):
        # 8 entries in mapping.json have "text " — must normalize
        assert _pg_type("text ") == "VARCHAR"

    def test_int(self):
        assert _pg_type("int") == "BIGINT"

    def test_float(self):
        assert _pg_type("float") == "DOUBLE PRECISION"

    def test_boolean(self):
        assert _pg_type("boolean") == "BOOLEAN"

    def test_date(self):
        assert _pg_type("date") == "DATE"

    def test_unknown_defaults_to_varchar(self):
        assert _pg_type("unknown_type") == "VARCHAR"

    def test_empty_defaults_to_varchar(self):
        assert _pg_type("") == "VARCHAR"


# ---------------------------------------------------------------------------
# Integration tests: generate_sql (against real mapping.json)
# ---------------------------------------------------------------------------

class TestGenerateSql:
    @pytest.fixture(scope="class")
    def sql(self):
        return generate_sql(MAPPING_PATH)

    def test_returns_string(self, sql):
        assert isinstance(sql, str)
        assert len(sql) > 0

    def test_contains_create_table(self, sql):
        assert "CREATE TABLE IF NOT EXISTS" in sql

    def test_proposal_table_present(self, sql):
        assert '"Proposal"' in sql

    def test_submitter_table_present(self, sql):
        assert '"Submitter"' in sql

    def test_proposal_primary_key(self, sql):
        # Proposal table should have ProposalID as PK
        assert 'PRIMARY KEY ("ProposalID")' in sql

    def test_submitter_composite_pk(self, sql):
        # Submitter has composite PK on userId + ProposalID
        assert 'PRIMARY KEY ("userId", "ProposalID")' in sql

    def test_type_mappings_in_output(self, sql):
        assert "BIGINT" in sql
        assert "VARCHAR" in sql
        assert "BOOLEAN" in sql
        assert "DATE" in sql
        assert "DOUBLE PRECISION" in sql

    def test_no_raw_text_type(self, sql):
        # "text" and "text " should never appear as SQL types
        import re
        # Match " text" or " text " as SQL column type (not inside identifiers)
        assert not re.search(r'\btext\b', sql, re.IGNORECASE), \
            "Raw 'text' type should be replaced with VARCHAR"

    def test_auxiliary_name_table(self, sql):
        assert '"name"' in sql

    def test_auxiliary_reviewer_organization_table(self, sql):
        assert '"reviewer_organization"' in sql

    def test_all_mapping_tables_present(self, sql):
        with open(MAPPING_PATH, encoding="utf-8") as f:
            data = json.load(f)
        tables = {e.get("Table_CTMD", "").strip() for e in data if e.get("Table_CTMD", "").strip()}
        for table in tables:
            assert f'"{table}"' in sql, f"Table {table} missing from generated SQL"

    def test_no_empty_column_names(self, sql):
        # No empty quoted identifiers
        assert '""' not in sql

    def test_generated_comment_present(self, sql):
        assert "Auto-generated from mapping.json" in sql
