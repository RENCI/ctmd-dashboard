"""
Flask CSV Upload API — Path B of the CTMD pipeline.

Handles user-uploaded CSV/JSON files for the ~19 tables not populated
by the automated REDCap sync. All database writes use psycopg2 COPY
(replacing the old csvsql subprocess). UTF-8 throughout.
Identifiers use psycopg2.sql.Identifier() — no string concatenation.

Endpoints
---------
GET  /table/<name>                  Read all rows
PUT  /table/<name>                  Replace table (DELETE + COPY)
POST /table/<name>                  Append to table (COPY)
POST /table/<name>/column/<col>     Partial column update
GET  /backup                        List backups
POST /backup                        Trigger pg_dump (enqueued)
DELETE /backup/<ts>                 Delete a backup (enqueued)
POST /restore/<ts>                  Restore from backup (enqueued)
POST /sync                          Trigger manual REDCap sync (enqueued)
GET  /task                          List RQ task queue status
GET  /task/<id>                     Get task status
DELETE /task/<id>                   Cancel task
"""

import csv
import datetime
import io
import json
import logging
import os
import stat
import subprocess
import tempfile
from stat import S_ISREG, ST_MODE, ST_MTIME

import psycopg2
from psycopg2 import sql
from flask import Flask, request
from flask_cors import CORS
import redis
from rq import Queue
from rq.registry import (
    StartedJobRegistry,
    FinishedJobRegistry,
    FailedJobRegistry,
    DeferredJobRegistry,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Worker functions — module-level so RQ can serialize (pickle) them
# ---------------------------------------------------------------------------

def _backup_database(backup_dir: str, ts: str) -> bool:
    """pg_dump the database to backup_dir/ts."""
    database_url = os.environ["DATABASE_URL"]
    os.makedirs(backup_dir, exist_ok=True)
    path = os.path.join(backup_dir, ts)
    cp = subprocess.run(
        ["pg_dump", "-O", "-f", path, database_url],
        capture_output=True,
    )
    if cp.returncode != 0:
        logger.error("backup failed: %s", cp.stderr.decode(errors="replace"))
        return False
    logger.info("backup written to %s", path)
    return True


def _delete_backup(backup_dir: str, ts: str) -> bool:
    """Delete a backup file."""
    try:
        os.remove(os.path.join(backup_dir, ts))
        return True
    except Exception as e:
        logger.error("delete backup error: %s", e)
        return False


def _restore_database(backup_dir: str, ts: str) -> bool:
    """Drop and recreate the public schema, then restore from pg_dump file."""
    database_url = os.environ["DATABASE_URL"]
    path = os.path.join(backup_dir, ts)
    try:
        conn = psycopg2.connect(database_url)
        conn.autocommit = True
        with conn.cursor() as cur:
            cur.execute("DROP SCHEMA public CASCADE")
            cur.execute("CREATE SCHEMA public")
        conn.close()
    except Exception as e:
        logger.error("clear schema failed: %s", e)
        return False

    cp = subprocess.run(
        ["psql", database_url, "-f", path],
        capture_output=True,
    )
    if cp.returncode != 0:
        logger.error("restore failed: %s", cp.stderr.decode(errors="replace"))
        return False
    logger.info("database restored from %s", path)
    return True


def _replace_table(table: str, tmpfile: str) -> bool:
    """DELETE all rows then COPY from tmpfile. Atomic transaction."""
    database_url = os.environ["DATABASE_URL"]
    try:
        conn = psycopg2.connect(database_url, options="-c client_encoding=UTF8")
        conn.autocommit = False
        columns = _read_csv_header(tmpfile)
        col_ids = sql.SQL(", ").join(sql.Identifier(c) for c in columns)
        with conn.cursor() as cur:
            cur.execute(sql.SQL("DELETE FROM {}").format(sql.Identifier(table)))
            with open(tmpfile, encoding="utf-8") as f:
                cur.copy_expert(
                    sql.SQL("COPY {} ({}) FROM STDIN WITH (FORMAT CSV, HEADER, NULL '')").format(
                        sql.Identifier(table), col_ids
                    ),
                    f,
                )
        conn.commit()
        conn.close()
        logger.info("replaced table %s", table)
        return True
    except Exception as e:
        logger.error("replace table %s failed: %s", table, e)
        try:
            conn.rollback()
            conn.close()
        except Exception:
            pass
        return False
    finally:
        _unlink(tmpfile)


def _append_table(table: str, tmpfile: str) -> bool:
    """COPY rows from tmpfile into the table (append)."""
    database_url = os.environ["DATABASE_URL"]
    try:
        conn = psycopg2.connect(database_url, options="-c client_encoding=UTF8")
        conn.autocommit = False
        columns = _read_csv_header(tmpfile)
        col_ids = sql.SQL(", ").join(sql.Identifier(c) for c in columns)
        with conn.cursor() as cur:
            with open(tmpfile, encoding="utf-8") as f:
                cur.copy_expert(
                    sql.SQL("COPY {} ({}) FROM STDIN WITH (FORMAT CSV, HEADER, NULL '')").format(
                        sql.Identifier(table), col_ids
                    ),
                    f,
                )
        conn.commit()
        conn.close()
        logger.info("appended to table %s", table)
        return True
    except Exception as e:
        logger.error("append table %s failed: %s", table, e)
        try:
            conn.rollback()
            conn.close()
        except Exception:
            pass
        return False
    finally:
        _unlink(tmpfile)


def _update_column(table: str, column: str, tmpfile: str) -> bool:
    """
    Partial column update: for each unique value of `column` in the upload,
    DELETE existing rows with that value then INSERT the new rows.

    Preserves siteId/ProposalID pair logic: if both siteId and ProposalID are
    present, deletes by the combined pair rather than by either column alone.
    """
    try:
        with open(tmpfile, encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        if not rows:
            return True

        headers = list(rows[0].keys())
        use_pair = (
            column in ("siteId", "ProposalID")
            and "siteId" in headers
            and "ProposalID" in headers
        )
        pair_col = "ProposalID" if column == "siteId" else "siteId"

        database_url = os.environ["DATABASE_URL"]
        conn = psycopg2.connect(database_url, options="-c client_encoding=UTF8")
        conn.autocommit = False
        deleted = set()

        with conn.cursor() as cur:
            for row in rows:
                val = row[column]
                if use_pair:
                    pair_val = row[pair_col]
                    key = (val, pair_val)
                    if key not in deleted:
                        cur.execute(
                            sql.SQL("DELETE FROM {} WHERE {} = %s AND {} = %s").format(
                                sql.Identifier(table),
                                sql.Identifier(column),
                                sql.Identifier(pair_col),
                            ),
                            (val, pair_val),
                        )
                        deleted.add(key)
                else:
                    if val not in deleted:
                        cur.execute(
                            sql.SQL("DELETE FROM {} WHERE {} = %s").format(
                                sql.Identifier(table), sql.Identifier(column)
                            ),
                            (val,),
                        )
                        deleted.add(val)

            # Re-insert via COPY from in-memory buffer
            buf = io.StringIO()
            writer = csv.DictWriter(buf, fieldnames=headers)
            writer.writeheader()
            writer.writerows(rows)
            buf.seek(0)

            col_ids = sql.SQL(", ").join(sql.Identifier(c) for c in headers)
            cur.copy_expert(
                sql.SQL("COPY {} ({}) FROM STDIN WITH (FORMAT CSV, HEADER, NULL '')").format(
                    sql.Identifier(table), col_ids
                ),
                buf,
            )

        conn.commit()
        conn.close()
        logger.info("column update %s.%s complete", table, column)
        return True
    except Exception as e:
        logger.error("column update %s.%s failed: %s", table, column, e)
        try:
            conn.rollback()
            conn.close()
        except Exception:
            pass
        return False
    finally:
        _unlink(tmpfile)


def _run_sync(mapping_path: str) -> bool:
    """Download from REDCap, transform, and bulk-load all REDCap-sourced tables.

    Also regenerates the `name` lookup table from the REDCap data dictionary.
    Acquires a Sherlock Redis distributed lock so only one sync runs at a
    time, whether triggered by the scheduler in main.py or by POST /sync.
    """
    import redis as redis_lib
    from sherlock import RedisLock
    from redcap_importer.downloader import RedcapDownloader
    from redcap_importer.mapping import load as load_mapping
    from transformer.transforms import transform_all
    from transformer.name_table import generate_name_table
    from loader.loader import connect, sync_redcap_tables, sync_name_table

    database_url = os.environ["DATABASE_URL"]
    lock_client = redis_lib.StrictRedis(
        host=os.environ.get("REDIS_LOCK_HOST", os.environ.get("REDIS_QUEUE_HOST", "localhost")),
        port=int(os.environ.get("REDIS_LOCK_PORT", os.environ.get("REDIS_QUEUE_PORT", "6379"))),
        db=int(os.environ.get("REDIS_LOCK_DB", 1)),
    )
    lock = RedisLock(
        "ctmd-sync",
        client=lock_client,
        expire=int(os.environ.get("REDIS_LOCK_EXPIRE", 7200)),
        timeout=int(os.environ.get("REDIS_LOCK_TIMEOUT", 7200)),
    )

    try:
        with lock:
            mapping_entries = load_mapping(mapping_path)
            records = RedcapDownloader(mapping_path).download_all()
            table_data = transform_all(records)
            name_rows = generate_name_table(mapping_entries)
            conn = connect(database_url)
            counts = sync_redcap_tables(conn, table_data)
            name_count = sync_name_table(conn, name_rows)
            conn.close()
            counts["name"] = name_count
            logger.info("sync complete: %s", counts)
            return True
    except Exception as e:
        logger.exception("sync failed: %s", e)
        return False


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _read_csv_header(path: str) -> list:
    """Return the column names from the first row of a UTF-8 CSV file."""
    with open(path, encoding="utf-8", newline="") as f:
        return next(csv.reader(f))


def _unlink(path: str):
    try:
        os.unlink(path)
    except Exception:
        pass


def _parse_upload() -> tuple:
    """
    Parse the uploaded file from the current Flask request.

    Accepts:
      - content-type: text/csv  — UTF-8 CSV file
      - content-type: application/json — JSON array of row objects

    Form fields:
      - data          (file)   Required. The uploaded file.
      - content-type  (str)    Required. MIME type of the upload.
      - json          (str)    Optional. JSON object of extra key→value pairs
                               appended as additional columns to every row.
      - has_comments  (str)    Optional. "true" to skip the first line of a CSV.

    Returns (columns: list[str], rows: list[list], kvp: dict).
    Raises ValueError on bad input.
    """
    f = request.files.get("data")
    if f is None:
        raise ValueError("missing 'data' file in request")

    content_type = request.form.get("content-type", "")
    kvp = json.loads(request.form.get("json", "{}"))
    has_comments = request.form.get("has_comments", "false").lower() == "true"

    extra_cols = list(kvp.keys())
    extra_vals = list(kvp.values())

    if "application/json" in content_type:
        data = json.load(f)
        if not data:
            return extra_cols, [], kvp
        file_cols = list(data[0].keys())
        columns = file_cols + extra_cols
        rows = [
            [row.get(c) for c in file_cols] + extra_vals
            for row in data
        ]
        return columns, rows, kvp

    if "text/csv" in content_type:
        text = f.read().decode("utf-8")
        reader = csv.reader(io.StringIO(text))
        if has_comments:
            next(reader)
        try:
            file_cols = next(reader)
        except StopIteration:
            return extra_cols, [], kvp
        columns = file_cols + extra_cols
        rows = [row + extra_vals for row in reader]
        return columns, rows, kvp

    raise ValueError(f"unsupported content-type: {content_type!r}")


def _write_tmpfile(columns: list, rows: list) -> str:
    """Write columns + rows to a named temp file as UTF-8 CSV. Returns the path."""
    tf = tempfile.NamedTemporaryFile(
        mode="w", suffix=".csv", encoding="utf-8", newline="", delete=False
    )
    writer = csv.writer(tf)
    writer.writerow(columns)
    for row in rows:
        writer.writerow(row)
    tf.close()
    return tf.name


def _validate_columns(database_url: str, table: str, columns: list) -> list:
    """
    Check that every column in `columns` exists in `table`.
    Returns a list of error strings; empty means valid.
    """
    try:
        conn = psycopg2.connect(database_url, options="-c client_encoding=UTF8")
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
                  AND table_name = %s
                """,
                (table,),
            )
            db_cols = {row[0] for row in cur.fetchall()}
        conn.close()
    except Exception as e:
        return [f"Could not validate table '{table}': {e}"]

    return [f"Unknown column: '{c}'" for c in columns if c not in db_cols]


# ---------------------------------------------------------------------------
# Flask app factory
# ---------------------------------------------------------------------------

def create_app(database_url: str = None, backup_dir: str = None,
               task_time: int = None, queue=None):
    """
    Create and return the Flask application.

    Parameters may be passed directly (useful for testing) or are read from
    environment variables if omitted.
    """
    db_url = database_url or os.environ.get("DATABASE_URL", "")
    bk_dir = backup_dir or os.environ.get("BACKUP_DIR", "/data/backups")
    t_time = task_time or int(os.environ.get("TASK_TIME", 3600))
    mapping_path = os.environ.get("MAPPING_PATH", "/data/mapping.json")

    app = Flask(__name__)
    if os.environ.get("LOCAL_ENV", "false").lower() == "true":
        CORS(app)

    if queue is None:
        redis_conn = redis.StrictRedis(
            host=os.environ["REDIS_QUEUE_HOST"],
            port=int(os.environ["REDIS_QUEUE_PORT"]),
            db=int(os.environ["REDIS_QUEUE_DB"]),
        )
        q = Queue('pipeline2', connection=redis_conn)
    else:
        redis_conn = getattr(queue, "connection", None)
        q = queue

    # ------------------------------------------------------------------ #
    # Backup / Restore                                                     #
    # ------------------------------------------------------------------ #

    @app.route("/backup", methods=["GET", "POST"])
    def backup():
        if request.method == "GET":
            entries = []
            try:
                for fn in os.listdir(bk_dir):
                    fpath = os.path.join(bk_dir, fn)
                    st = os.stat(fpath)
                    if S_ISREG(st[ST_MODE]):
                        entries.append((st[ST_MTIME], fn))
                entries = [fn for _, fn in sorted(entries, reverse=True)]
            except Exception as e:
                logger.error("list backups error: %s", e)
            return json.dumps(entries)

        ts = str(datetime.datetime.now())
        job = q.enqueue(_backup_database, bk_dir, ts, job_timeout=t_time)
        return json.dumps(job.id)

    @app.route("/backup/<string:ts>", methods=["DELETE"])
    def delete_backup(ts):
        job = q.enqueue(_delete_backup, bk_dir, ts, job_timeout=t_time)
        return json.dumps(job.id)

    @app.route("/restore/<string:ts>", methods=["POST"])
    def restore(ts):
        job = q.enqueue(_restore_database, bk_dir, ts, job_timeout=t_time)
        return json.dumps(job.id)

    # ------------------------------------------------------------------ #
    # Sync                                                                 #
    # ------------------------------------------------------------------ #

    @app.route("/sync", methods=["POST"])
    def sync():
        job = q.enqueue(_run_sync, mapping_path, job_timeout=t_time)
        return json.dumps(job.id)

    # ------------------------------------------------------------------ #
    # Table operations                                                     #
    # ------------------------------------------------------------------ #

    @app.route("/table/<string:tablename>", methods=["GET", "POST", "PUT"])
    def table(tablename):
        if request.method == "GET":
            try:
                conn = psycopg2.connect(db_url, options="-c client_encoding=UTF8")
                with conn.cursor() as cur:
                    cur.execute(
                        sql.SQL("SELECT * FROM {}").format(sql.Identifier(tablename))
                    )
                    colnames = [desc.name for desc in cur.description]
                    rows = cur.fetchall()
                conn.close()
                return json.dumps(
                    [{col: str(val) for col, val in zip(colnames, row)} for row in rows]
                )
            except Exception as e:
                logger.error("GET /table/%s error: %s", tablename, e)
                return json.dumps({"error": str(e)}), 500

        try:
            columns, rows, _ = _parse_upload()
        except ValueError as e:
            return json.dumps({"error": str(e)}), 400

        errors = _validate_columns(db_url, tablename, columns)
        if errors:
            return json.dumps(errors), 400

        tmpfile = _write_tmpfile(columns, rows)
        worker = _replace_table if request.method == "PUT" else _append_table
        job = q.enqueue(worker, tablename, tmpfile, job_timeout=t_time)
        return json.dumps(job.id)

    @app.route("/table/<string:tablename>/column/<string:columnname>", methods=["POST"])
    def table_column(tablename, columnname):
        try:
            columns, rows, _ = _parse_upload()
        except ValueError as e:
            return json.dumps({"error": str(e)}), 400

        errors = _validate_columns(db_url, tablename, columns)
        if errors:
            return json.dumps(errors), 400

        tmpfile = _write_tmpfile(columns, rows)
        job = q.enqueue(_update_column, tablename, columnname, tmpfile,
                        job_timeout=t_time)
        return json.dumps(job.id)

    # ------------------------------------------------------------------ #
    # Task management                                                      #
    # ------------------------------------------------------------------ #

    @app.route("/task", methods=["GET"])
    def task():
        def _registry(cls):
            r = cls("default", connection=redis_conn)
            return {"job_ids": r.get_job_ids(), "expired_job_ids": r.get_expired_job_ids()}

        return json.dumps({
            "queued": q.job_ids,
            "started": _registry(StartedJobRegistry),
            "finished": _registry(FinishedJobRegistry),
            "failed": _registry(FailedJobRegistry),
            "deferred": _registry(DeferredJobRegistry),
        })

    @app.route("/task/<string:taskid>", methods=["GET", "DELETE"])
    def task_id(taskid):
        job = q.fetch_job(taskid)
        if job is None:
            return json.dumps({"error": "task not found"}), 404

        if request.method == "DELETE":
            job.cancel()
            return json.dumps(taskid)

        return json.dumps({
            "status": str(job.get_status()),
            "name": job.func_name,
            "created_at": str(job.created_at),
            "enqueued_at": str(job.enqueued_at),
            "started_at": str(job.started_at),
            "ended_at": str(job.ended_at),
            "description": job.description,
            "result": str(job.result),
        })

    return app


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    create_app().run(host="0.0.0.0")
