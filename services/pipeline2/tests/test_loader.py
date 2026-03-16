"""Tests for loader/loader.py migration runner.

Uses an in-memory SQLite-compatible approach via a real PostgreSQL connection
is not available in the container test environment. Migration runner logic is
tested by mocking the psycopg2 connection with a lightweight stub that records
executed SQL.
"""

import os
import tempfile
import pytest
from unittest.mock import MagicMock, call, patch

from loader.loader import (
    _ensure_migrations_table,
    _get_applied_migrations,
    apply_migrations,
)


# ---------------------------------------------------------------------------
# Connection stub
# ---------------------------------------------------------------------------

class FakeCursor:
    """Records execute calls and returns configurable fetchall results."""

    def __init__(self):
        self.executed = []
        self._fetchall_result = []

    def execute(self, sql, params=None):
        # psycopg2 sql.SQL objects — normalise to string for assertions
        stmt = sql.as_string(None) if hasattr(sql, "as_string") else str(sql)
        self.executed.append((stmt, params))

    def fetchall(self):
        return self._fetchall_result

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

        applied_order = []

        def fake_get_applied(conn):
            return set()

        def fake_ensure(conn):
            pass

        original_open = open

        with patch("loader.loader._ensure_migrations_table", side_effect=fake_ensure), \
             patch("loader.loader._get_applied_migrations", side_effect=fake_get_applied):
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
