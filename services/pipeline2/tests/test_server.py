"""Tests for server.py — Flask CSV Upload API.

Uses Flask's test client with a fake RQ queue to verify endpoint
behaviour without real Redis, database, or filesystem dependencies.
"""

import csv
import io
import json
import os
import tempfile
import pytest
from unittest.mock import MagicMock, patch, call

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from server import create_app, _parse_upload, _write_tmpfile, _validate_columns, _read_csv_header


# ---------------------------------------------------------------------------
# Fake RQ queue
# ---------------------------------------------------------------------------

class FakeJob:
    def __init__(self, job_id="fake-job-id"):
        self.id = job_id
        self.func_name = "fake_func"
        self.created_at = "2024-01-01"
        self.enqueued_at = "2024-01-01"
        self.started_at = None
        self.ended_at = None
        self.description = "fake job"
        self.result = None
        self._cancelled = False

    def get_status(self):
        return "queued"

    def cancel(self):
        self._cancelled = True


class FakeQueue:
    """Records enqueue calls; returns FakeJob instances."""

    def __init__(self):
        self.enqueued = []
        self.connection = None
        self.job_ids = []
        self._jobs = {}

    def enqueue(self, func, *args, **kwargs):
        job = FakeJob(f"job-{len(self.enqueued)}")
        self.enqueued.append((func, args, kwargs))
        self._jobs[job.id] = job
        self.job_ids.append(job.id)
        return job

    def fetch_job(self, job_id):
        return self._jobs.get(job_id)


# ---------------------------------------------------------------------------
# App fixture
# ---------------------------------------------------------------------------

@pytest.fixture
def fake_queue():
    return FakeQueue()


@pytest.fixture
def client(fake_queue):
    app = create_app(
        database_url="postgresql://test/testdb",
        backup_dir="/tmp/test_backups",
        task_time=60,
        queue=fake_queue,
    )
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


# ---------------------------------------------------------------------------
# Helpers for building multipart uploads
# ---------------------------------------------------------------------------

def _csv_upload(rows: list, kvp: dict = None, has_comments: bool = False):
    """Build form data dict for a CSV upload."""
    buf = io.StringIO()
    if rows:
        writer = csv.writer(buf)
        for row in rows:
            writer.writerow(row)
    return {
        "data": (io.BytesIO(buf.getvalue().encode("utf-8")), "upload.csv"),
        "content-type": "text/csv",
        "json": json.dumps(kvp or {}),
        "has_comments": "true" if has_comments else "false",
    }


def _json_upload(rows: list, kvp: dict = None):
    """Build form data dict for a JSON upload."""
    return {
        "data": (io.BytesIO(json.dumps(rows).encode("utf-8")), "upload.json"),
        "content-type": "application/json",
        "json": json.dumps(kvp or {}),
    }


# ---------------------------------------------------------------------------
# GET /table/<name>
# ---------------------------------------------------------------------------

class TestGetTable:
    def test_returns_rows_as_json(self, client):
        mock_rows = [("Alice", "30"), ("Bob", "25")]
        mock_desc = [MagicMock(name="name"), MagicMock(name="age")]
        mock_desc[0].name = "name"
        mock_desc[1].name = "age"

        mock_cur = MagicMock()
        mock_cur.__enter__ = lambda s: s
        mock_cur.__exit__ = MagicMock(return_value=False)
        mock_cur.description = mock_desc
        mock_cur.fetchall.return_value = mock_rows

        mock_conn = MagicMock()
        mock_conn.cursor.return_value = mock_cur

        with patch("server.psycopg2.connect", return_value=mock_conn):
            resp = client.get("/table/StudyProfile")

        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert data[0]["name"] == "Alice"
        assert data[1]["age"] == "25"

    def test_returns_500_on_db_error(self, client):
        with patch("server.psycopg2.connect", side_effect=Exception("connection refused")):
            resp = client.get("/table/StudyProfile")
        assert resp.status_code == 500


# ---------------------------------------------------------------------------
# PUT /table/<name>  (replace)
# ---------------------------------------------------------------------------

class TestPutTable:
    def test_enqueues_replace_job(self, client, fake_queue):
        data = _csv_upload([["col1", "col2"], ["a", "b"]])
        with patch("server._validate_columns", return_value=[]):
            resp = client.put("/table/StudyProfile", data=data,
                              content_type="multipart/form-data")

        assert resp.status_code == 200
        assert len(fake_queue.enqueued) == 1
        func, args, _ = fake_queue.enqueued[0]
        from server import _replace_table
        assert func is _replace_table

    def test_returns_job_id(self, client, fake_queue):
        data = _csv_upload([["col1"], ["val1"]])
        with patch("server._validate_columns", return_value=[]):
            resp = client.put("/table/StudyProfile", data=data,
                              content_type="multipart/form-data")
        job_id = json.loads(resp.data)
        assert job_id == "job-0"

    def test_returns_400_on_validation_error(self, client):
        data = _csv_upload([["bad_col"], ["val"]])
        with patch("server._validate_columns", return_value=["Unknown column: 'bad_col'"]):
            resp = client.put("/table/StudyProfile", data=data,
                              content_type="multipart/form-data")
        assert resp.status_code == 400
        errors = json.loads(resp.data)
        assert any("bad_col" in e for e in errors)

    def test_returns_400_on_missing_file(self, client):
        resp = client.put("/table/StudyProfile",
                          data={"content-type": "text/csv", "json": "{}"},
                          content_type="multipart/form-data")
        assert resp.status_code == 400


# ---------------------------------------------------------------------------
# POST /table/<name>  (append)
# ---------------------------------------------------------------------------

class TestPostTable:
    def test_enqueues_append_job(self, client, fake_queue):
        data = _csv_upload([["col1"], ["val1"]])
        with patch("server._validate_columns", return_value=[]):
            resp = client.post("/table/StudyProfile", data=data,
                               content_type="multipart/form-data")
        assert resp.status_code == 200
        func, _, _ = fake_queue.enqueued[0]
        from server import _append_table
        assert func is _append_table

    def test_accepts_json_upload(self, client, fake_queue):
        data = _json_upload([{"col1": "val1"}])
        with patch("server._validate_columns", return_value=[]):
            resp = client.post("/table/StudyProfile", data=data,
                               content_type="multipart/form-data")
        assert resp.status_code == 200
        assert len(fake_queue.enqueued) == 1

    def test_kvp_columns_included_in_validation(self, client, fake_queue):
        data = _csv_upload([["col1"], ["val1"]], kvp={"ProposalID": "42"})
        captured_columns = []

        def fake_validate(db_url, table, columns):
            captured_columns.extend(columns)
            return []

        with patch("server._validate_columns", side_effect=fake_validate):
            client.post("/table/StudySites", data=data,
                        content_type="multipart/form-data")

        assert "col1" in captured_columns
        assert "ProposalID" in captured_columns


# ---------------------------------------------------------------------------
# POST /table/<name>/column/<col>
# ---------------------------------------------------------------------------

class TestTableColumn:
    def test_enqueues_update_column_job(self, client, fake_queue):
        data = _csv_upload([["siteId", "val"], ["1", "x"]])
        with patch("server._validate_columns", return_value=[]):
            resp = client.post("/table/StudySites/column/siteId", data=data,
                               content_type="multipart/form-data")
        assert resp.status_code == 200
        func, args, _ = fake_queue.enqueued[0]
        from server import _update_column
        assert func is _update_column
        # args: (db_url, table, column, tmpfile)
        assert args[1] == "StudySites"
        assert args[2] == "siteId"

    def test_returns_400_on_validation_error(self, client):
        data = _csv_upload([["nonexistent_col"], ["val"]])
        with patch("server._validate_columns", return_value=["Unknown column: 'nonexistent_col'"]):
            resp = client.post("/table/StudySites/column/siteId", data=data,
                               content_type="multipart/form-data")
        assert resp.status_code == 400


# ---------------------------------------------------------------------------
# GET/POST /backup
# ---------------------------------------------------------------------------

class TestBackup:
    def test_get_returns_backup_list(self, client):
        with patch("os.listdir", return_value=["2024-01-01", "2024-01-02"]), \
             patch("os.stat") as mock_stat:
            mock_stat.return_value = MagicMock(
                **{f"__getitem__.side_effect": lambda key: {
                    0o100644: 0o100644,  # ST_MODE regular file
                }.get(key, 0)}
            )
            # Patch S_ISREG to always return True for simplicity
            with patch("server.S_ISREG", return_value=True):
                resp = client.get("/backup")
        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert isinstance(data, list)

    def test_post_enqueues_backup_job(self, client, fake_queue):
        resp = client.post("/backup")
        assert resp.status_code == 200
        assert len(fake_queue.enqueued) == 1
        func, _, _ = fake_queue.enqueued[0]
        from server import _backup_database
        assert func is _backup_database

    def test_post_returns_job_id(self, client, fake_queue):
        resp = client.post("/backup")
        job_id = json.loads(resp.data)
        assert isinstance(job_id, str)


# ---------------------------------------------------------------------------
# DELETE /backup/<ts>
# ---------------------------------------------------------------------------

class TestDeleteBackup:
    def test_enqueues_delete_job(self, client, fake_queue):
        resp = client.delete("/backup/2024-01-01 12:00:00")
        assert resp.status_code == 200
        func, _, _ = fake_queue.enqueued[0]
        from server import _delete_backup
        assert func is _delete_backup


# ---------------------------------------------------------------------------
# POST /restore/<ts>
# ---------------------------------------------------------------------------

class TestRestore:
    def test_enqueues_restore_job(self, client, fake_queue):
        resp = client.post("/restore/2024-01-01 12:00:00")
        assert resp.status_code == 200
        func, _, _ = fake_queue.enqueued[0]
        from server import _restore_database
        assert func is _restore_database


# ---------------------------------------------------------------------------
# POST /sync
# ---------------------------------------------------------------------------

class TestSync:
    def test_enqueues_sync_job(self, client, fake_queue):
        resp = client.post("/sync")
        assert resp.status_code == 200
        assert len(fake_queue.enqueued) == 1
        func, _, _ = fake_queue.enqueued[0]
        from server import _run_sync
        assert func is _run_sync

    def test_returns_job_id(self, client, fake_queue):
        resp = client.post("/sync")
        job_id = json.loads(resp.data)
        assert isinstance(job_id, str)


# ---------------------------------------------------------------------------
# GET /task
# ---------------------------------------------------------------------------

class TestGetTask:
    def test_returns_queue_structure(self, client, fake_queue):
        mock_registry = MagicMock()
        mock_registry.get_job_ids.return_value = []
        mock_registry.get_expired_job_ids.return_value = []

        with patch("server.StartedJobRegistry", return_value=mock_registry), \
             patch("server.FinishedJobRegistry", return_value=mock_registry), \
             patch("server.FailedJobRegistry", return_value=mock_registry), \
             patch("server.DeferredJobRegistry", return_value=mock_registry):
            resp = client.get("/task")

        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert "queued" in data
        assert "started" in data
        assert "finished" in data
        assert "failed" in data
        assert "deferred" in data


# ---------------------------------------------------------------------------
# GET/DELETE /task/<id>
# ---------------------------------------------------------------------------

class TestTaskId:
    def test_get_returns_job_info(self, client, fake_queue):
        # Enqueue a job so it exists in the fake queue
        fake_queue.enqueue(lambda: None)
        job_id = fake_queue.job_ids[0]

        resp = client.get(f"/task/{job_id}")
        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert "status" in data

    def test_get_returns_404_for_unknown_job(self, client):
        resp = client.get("/task/nonexistent-id")
        assert resp.status_code == 404

    def test_delete_cancels_job(self, client, fake_queue):
        fake_queue.enqueue(lambda: None)
        job_id = fake_queue.job_ids[0]

        resp = client.delete(f"/task/{job_id}")
        assert resp.status_code == 200
        assert fake_queue._jobs[job_id]._cancelled

    def test_delete_returns_job_id(self, client, fake_queue):
        fake_queue.enqueue(lambda: None)
        job_id = fake_queue.job_ids[0]

        resp = client.delete(f"/task/{job_id}")
        returned_id = json.loads(resp.data)
        assert returned_id == job_id


# ---------------------------------------------------------------------------
# _parse_upload helper
# ---------------------------------------------------------------------------

class TestParseUpload:
    def _make_request(self, app, data):
        with app.test_request_context(
            "/table/Test", method="POST",
            data=data, content_type="multipart/form-data"
        ):
            return _parse_upload()

    @pytest.fixture
    def app(self, fake_queue):
        return create_app(
            database_url="postgresql://test/testdb",
            backup_dir="/tmp",
            task_time=60,
            queue=fake_queue,
        )

    def test_parses_csv(self, app):
        data = _csv_upload([["col1", "col2"], ["a", "b"], ["c", "d"]])
        columns, rows, kvp = self._make_request(app, data)
        assert columns == ["col1", "col2"]
        assert len(rows) == 2
        assert rows[0] == ["a", "b"]

    def test_parses_json(self, app):
        data = _json_upload([{"name": "Alice", "age": "30"}])
        columns, rows, kvp = self._make_request(app, data)
        assert set(columns) == {"name", "age"}
        assert len(rows) == 1

    def test_applies_kvp_to_csv(self, app):
        data = _csv_upload([["col1"], ["val1"]], kvp={"ProposalID": "99"})
        columns, rows, _ = self._make_request(app, data)
        assert "ProposalID" in columns
        assert "99" in rows[0]

    def test_applies_kvp_to_json(self, app):
        data = _json_upload([{"col1": "val1"}], kvp={"ProposalID": "99"})
        columns, rows, _ = self._make_request(app, data)
        assert "ProposalID" in columns
        assert "99" in rows[0]

    def test_skips_comment_row_in_csv(self, app):
        data = _csv_upload(
            [["# this is a comment"], ["col1", "col2"], ["a", "b"]],
            has_comments=True,
        )
        columns, rows, _ = self._make_request(app, data)
        assert columns == ["col1", "col2"]
        assert len(rows) == 1

    def test_raises_on_unsupported_content_type(self, app):
        data = {
            "data": (io.BytesIO(b"data"), "f.xml"),
            "content-type": "application/xml",
            "json": "{}",
        }
        with pytest.raises(ValueError, match="unsupported content-type"):
            self._make_request(app, data)


# ---------------------------------------------------------------------------
# _write_tmpfile helper
# ---------------------------------------------------------------------------

class TestWriteTmpfile:
    def test_creates_csv_with_header(self):
        path = _write_tmpfile(["a", "b"], [["1", "2"], ["3", "4"]])
        try:
            with open(path, encoding="utf-8", newline="") as f:
                reader = csv.reader(f)
                rows = list(reader)
            assert rows[0] == ["a", "b"]
            assert rows[1] == ["1", "2"]
            assert rows[2] == ["3", "4"]
        finally:
            os.unlink(path)

    def test_file_is_utf8(self):
        path = _write_tmpfile(["name"], [["José"], ["Ångström"]])
        try:
            with open(path, encoding="utf-8") as f:
                content = f.read()
            assert "José" in content
            assert "Ångström" in content
        finally:
            os.unlink(path)
