"""Tests for loader/loader.py — migration runner and bulk sync.

Uses a lightweight connection/cursor stub that records executed SQL and
copy_expert calls. No real PostgreSQL connection required.
"""

import os
import tempfile
import pytest
from unittest.mock import patch

from loader.loader import (
    _ensure_migrations_table,
    _get_applied_migrations,
    apply_migrations,
    _copy_rows,
    sync_redcap_tables,
    REDCAP_TABLES,
)


# ---------------------------------------------------------------------------
# Connection stub
# ---------------------------------------------------------------------------

class FakeCursor:
    """Records execute and copy_expert calls; returns configurable fetchall results."""

    def __init__(self):
        self.executed = []
        self._fetchall_result = []
        self.copy_expert_calls = []

    @staticmethod
    def _sql_to_str(sql_obj):
        """Convert a psycopg2 sql object to a string for test assertions.

        sql.Identifier.as_string() requires a real connection context; for
        composed statements that include identifiers we fall back to repr(),
        which gives a stable, readable form like:
            Composed([SQL('TRUNCATE TABLE '), Identifier('Proposal'), SQL(' CASCADE')])
        """
        if isinstance(sql_obj, str):
            return sql_obj
        if hasattr(sql_obj, "as_string"):
            try:
                return sql_obj.as_string(None)
            except TypeError:
                return str(sql_obj)
        return str(sql_obj)

    def execute(self, sql, params=None):
        self.executed.append((self._sql_to_str(sql), params))

    def fetchall(self):
        return self._fetchall_result

    def copy_expert(self, sql, buf):
        content = buf.read()
        self.copy_expert_calls.append((self._sql_to_str(sql), content))

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass


class FakeConn:
    def __init__(self, fetchall_result=None):
        self.cursor_obj = FakeCursor()
        if fetchall_result is not None:
            self.cursor_obj._fetchall_result = fetchall_result
        self.committed = False
        self.rolled_back = False

    def cursor(self):
        return self.cursor_obj

    def commit(self):
        self.committed = True

    def rollback(self):
        self.rolled_back = True


# ---------------------------------------------------------------------------
# _ensure_migrations_table
# ---------------------------------------------------------------------------

class TestEnsureMigrationsTable:
    def test_creates_schema_migrations_table(self):
        conn = FakeConn()
        _ensure_migrations_table(conn)
        stmts = [s for s, _ in conn.cursor_obj.executed]
        assert any("schema_migrations" in s for s in stmts)
        assert conn.committed

    def test_uses_create_table_if_not_exists(self):
        conn = FakeConn()
        _ensure_migrations_table(conn)
        stmts = " ".join(s for s, _ in conn.cursor_obj.executed)
        assert "CREATE TABLE IF NOT EXISTS" in stmts


# ---------------------------------------------------------------------------
# _get_applied_migrations
# ---------------------------------------------------------------------------

class TestGetAppliedMigrations:
    def test_returns_set_of_filenames(self):
        conn = FakeConn(fetchall_result=[("001_initial_schema.sql",), ("002_add_index.sql",)])
        result = _get_applied_migrations(conn)
        assert result == {"001_initial_schema.sql", "002_add_index.sql"}

    def test_returns_empty_set_when_none_applied(self):
        conn = FakeConn(fetchall_result=[])
        result = _get_applied_migrations(conn)
        assert result == set()


# ---------------------------------------------------------------------------
# apply_migrations
# ---------------------------------------------------------------------------

class TestApplyMigrations:
    def _make_migrations_dir(self, files: dict) -> str:
        """Create a temp dir with the given filename → SQL content mapping."""
        tmpdir = tempfile.mkdtemp()
        for filename, content in files.items():
            with open(os.path.join(tmpdir, filename), "w") as f:
                f.write(content)
        return tmpdir

    def test_applies_pending_migration(self):
        tmpdir = self._make_migrations_dir({
            "001_initial_schema.sql": "CREATE TABLE foo (id INT);"
        })
        conn = FakeConn(fetchall_result=[])  # nothing applied yet

        with patch("loader.loader._ensure_migrations_table"), \
             patch("loader.loader._get_applied_migrations", return_value=set()):
            applied = apply_migrations(conn, tmpdir)

        assert applied == ["001_initial_schema.sql"]

    def test_skips_already_applied_migration(self):
        tmpdir = self._make_migrations_dir({
            "001_initial_schema.sql": "CREATE TABLE foo (id INT);"
        })
        already_applied = {"001_initial_schema.sql"}

        with patch("loader.loader._ensure_migrations_table"), \
             patch("loader.loader._get_applied_migrations", return_value=already_applied):
            applied = apply_migrations(FakeConn(), tmpdir)

        assert applied == []

    def test_applies_only_new_migrations(self):
        tmpdir = self._make_migrations_dir({
            "001_initial_schema.sql": "CREATE TABLE foo (id INT);",
            "002_add_index.sql": "CREATE INDEX idx ON foo (id);",
        })
        already_applied = {"001_initial_schema.sql"}

        with patch("loader.loader._ensure_migrations_table"), \
             patch("loader.loader._get_applied_migrations", return_value=already_applied):
            applied = apply_migrations(FakeConn(), tmpdir)

        assert applied == ["002_add_index.sql"]

    def test_applies_migrations_in_filename_order(self):
        tmpdir = self._make_migrations_dir({
            "003_third.sql": "SELECT 3;",
            "001_first.sql": "SELECT 1;",
            "002_second.sql": "SELECT 2;",
        })

        with patch("loader.loader._ensure_migrations_table"), \
             patch("loader.loader._get_applied_migrations", return_value=set()):
            applied = apply_migrations(FakeConn(), tmpdir)

        assert applied == ["001_first.sql", "002_second.sql", "003_third.sql"]

    def test_returns_empty_list_when_no_migrations_dir_files(self):
        tmpdir = tempfile.mkdtemp()  # empty dir

        with patch("loader.loader._ensure_migrations_table"), \
             patch("loader.loader._get_applied_migrations", return_value=set()):
            applied = apply_migrations(FakeConn(), tmpdir)

        assert applied == []

    def test_commits_after_each_migration(self):
        tmpdir = self._make_migrations_dir({
            "001_initial_schema.sql": "CREATE TABLE foo (id INT);"
        })
        conn = FakeConn()

        with patch("loader.loader._ensure_migrations_table"), \
             patch("loader.loader._get_applied_migrations", return_value=set()):
            apply_migrations(conn, tmpdir)

        assert conn.committed


# ---------------------------------------------------------------------------
# _copy_rows
# ---------------------------------------------------------------------------

class TestCopyRows:
    def test_returns_zero_for_empty_rows(self):
        conn = FakeConn()
        result = _copy_rows(conn.cursor_obj, "MyTable", [])
        assert result == 0
        assert len(conn.cursor_obj.copy_expert_calls) == 0

    def test_returns_correct_row_count(self):
        conn = FakeConn()
        rows = [{"col": "a"}, {"col": "b"}, {"col": "c"}]
        result = _copy_rows(conn.cursor_obj, "MyTable", rows)
        assert result == 3

    def test_calls_copy_expert_once(self):
        conn = FakeConn()
        _copy_rows(conn.cursor_obj, "MyTable", [{"col": "val"}])
        assert len(conn.cursor_obj.copy_expert_calls) == 1

    def test_csv_contains_row_values(self):
        conn = FakeConn()
        rows = [{"name": "Alice", "score": "42"}]
        _copy_rows(conn.cursor_obj, "MyTable", rows)
        _, csv_data = conn.cursor_obj.copy_expert_calls[0]
        assert "Alice" in csv_data
        assert "42" in csv_data

    def test_all_columns_written(self):
        conn = FakeConn()
        rows = [{"col_a": "x", "col_b": "y", "col_c": "z"}]
        _copy_rows(conn.cursor_obj, "MyTable", rows)
        _, csv_data = conn.cursor_obj.copy_expert_calls[0]
        assert "x" in csv_data
        assert "y" in csv_data
        assert "z" in csv_data

    def test_copy_sql_references_table_name(self):
        conn = FakeConn()
        _copy_rows(conn.cursor_obj, "TargetTable", [{"col": "val"}])
        copy_stmt, _ = conn.cursor_obj.copy_expert_calls[0]
        assert "TargetTable" in copy_stmt

    def test_multiple_rows_all_written(self):
        conn = FakeConn()
        rows = [{"id": "1", "val": "a"}, {"id": "2", "val": "b"}]
        _copy_rows(conn.cursor_obj, "MyTable", rows)
        _, csv_data = conn.cursor_obj.copy_expert_calls[0]
        assert "1" in csv_data
        assert "2" in csv_data


# ---------------------------------------------------------------------------
# sync_redcap_tables
# ---------------------------------------------------------------------------

class TestSyncRedcapTables:
    def test_commits_on_success(self):
        conn = FakeConn()
        sync_redcap_tables(conn, {})
        assert conn.committed

    def test_rollback_on_exception(self):
        conn = FakeConn()
        table_data = {"Proposal": [{"ProposalID": 1}]}
        with patch("loader.loader._copy_rows", side_effect=Exception("DB error")):
            with pytest.raises(Exception, match="DB error"):
                sync_redcap_tables(conn, table_data)
        assert conn.rolled_back

    def test_exception_reraised_after_rollback(self):
        conn = FakeConn()
        table_data = {"Proposal": [{"ProposalID": 1}]}
        with patch("loader.loader._copy_rows", side_effect=RuntimeError("boom")):
            with pytest.raises(RuntimeError, match="boom"):
                sync_redcap_tables(conn, table_data)

    def test_no_commit_on_failure(self):
        conn = FakeConn()
        table_data = {"Proposal": [{"ProposalID": 1}]}
        with patch("loader.loader._copy_rows", side_effect=Exception("fail")):
            with pytest.raises(Exception):
                sync_redcap_tables(conn, table_data)
        assert not conn.committed

    def test_truncates_all_redcap_tables(self):
        # Empty table_data: _copy_rows never called; only TRUNCATEs in executed
        conn = FakeConn()
        sync_redcap_tables(conn, {})
        truncate_stmts = [s for s, _ in conn.cursor_obj.executed if "TRUNCATE" in s.upper()]
        assert len(truncate_stmts) == len(REDCAP_TABLES)

    def test_truncates_in_reverse_order(self):
        # Last table in REDCAP_TABLES should be truncated first (FK-safe reversal).
        # Match Identifier('TableName') from the repr to avoid substring false
        # positives (e.g. "Proposal" inside "Proposal_ConsultOptions").
        conn = FakeConn()
        sync_redcap_tables(conn, {})
        truncate_stmts = [s for s, _ in conn.cursor_obj.executed if "TRUNCATE" in s.upper()]
        assert f"Identifier('{REDCAP_TABLES[-1]}')" in truncate_stmts[0]
        assert f"Identifier('{REDCAP_TABLES[0]}')" in truncate_stmts[-1]

    def test_returns_row_counts(self):
        conn = FakeConn()
        table_data = {"Proposal": [{"ProposalID": 1}, {"ProposalID": 2}]}
        with patch("loader.loader._copy_rows", side_effect=lambda cur, tbl, rows: len(rows)):
            counts = sync_redcap_tables(conn, table_data)
        assert counts["Proposal"] == 2

    def test_empty_tables_counted_as_zero(self):
        conn = FakeConn()
        counts = sync_redcap_tables(conn, {})
        for table in REDCAP_TABLES:
            assert counts[table] == 0

    def test_copy_not_called_for_empty_tables(self):
        conn = FakeConn()
        with patch("loader.loader._copy_rows") as mock_copy:
            sync_redcap_tables(conn, {})
        mock_copy.assert_not_called()

    def test_copy_called_for_nonempty_table(self):
        conn = FakeConn()
        table_data = {"Proposal": [{"ProposalID": 1}]}
        with patch("loader.loader._copy_rows", return_value=1) as mock_copy:
            sync_redcap_tables(conn, table_data)
        mock_copy.assert_called_once()
