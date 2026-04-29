"""Pipeline entry point.

Startup sequence:
1. Read env vars
2. Wait for Redis and PostgreSQL to become reachable
3. Apply pending SQL migrations (when CREATE_TABLES=1)
4. Start Flask API server as a subprocess
5. Start RQ worker as a subprocess
6. Run the sync scheduler loop (schedule library)

Sync concurrency:
  _run_sync (server.py) acquires a Sherlock Redis lock so only one sync
  runs at a time, whether triggered by the scheduler here or by POST /sync.
"""

import logging
import os
import time
from multiprocessing import Process

import redis
import schedule
from rq import Queue

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Dependency wait helpers
# ---------------------------------------------------------------------------

def _wait_for_redis(conn, retries: int = 30, delay: int = 2) -> None:
    for attempt in range(retries):
        try:
            conn.ping()
            return
        except Exception:
            log.info("Waiting for Redis (attempt %d/%d)...", attempt + 1, retries)
            time.sleep(delay)
    raise RuntimeError("Redis not available after %d retries" % retries)


def _wait_for_postgres(database_url: str, retries: int = 30, delay: int = 2) -> None:
    import psycopg2
    for attempt in range(retries):
        try:
            c = psycopg2.connect(database_url)
            c.close()
            return
        except Exception:
            log.info("Waiting for PostgreSQL (attempt %d/%d)...", attempt + 1, retries)
            time.sleep(delay)
    raise RuntimeError("PostgreSQL not available after %d retries" % retries)


# ---------------------------------------------------------------------------
# Migrations
# ---------------------------------------------------------------------------

def _apply_migrations(database_url: str) -> None:
    import psycopg2
    from loader.loader import apply_migrations
    migrations_dir = os.path.join(os.path.dirname(__file__), "migrations")
    conn = psycopg2.connect(database_url)
    try:
        applied = apply_migrations(conn, migrations_dir)
        if applied:
            log.info("Applied migrations: %s", applied)
        else:
            log.info("No new migrations to apply")
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Subprocess targets
# ---------------------------------------------------------------------------

def _run_flask() -> None:
    """Flask API server (runs in its own process)."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    from server import create_app
    app = create_app()
    app.run(host="0.0.0.0", port=5000)


def _run_worker() -> None:
    """RQ worker (runs in its own process)."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    import redis as redis_lib
    from rq import Worker, Queue as RQQueue
    r = redis_lib.StrictRedis(
        host=os.environ.get("REDIS_QUEUE_HOST", "localhost"),
        port=int(os.environ.get("REDIS_QUEUE_PORT", 6379)),
        db=int(os.environ.get("REDIS_QUEUE_DB", 0)),
    )
    q = RQQueue('pipeline2', connection=r)
    worker = Worker([q], connection=r)
    worker.work()


# ---------------------------------------------------------------------------
# Scheduler
# ---------------------------------------------------------------------------

def _enqueue_sync(queue: Queue) -> None:
    """Enqueue a REDCap sync job onto the RQ queue."""
    from server import _run_sync
    database_url = os.environ.get("DATABASE_URL", "")
    mapping_path = os.environ.get("MAPPING_PATH", "/data/mapping.json")
    task_time = int(os.environ.get("TASK_TIME", 3600))
    log.info("Enqueueing scheduled REDCap sync")
    queue.enqueue(_run_sync, database_url, mapping_path, job_timeout=task_time)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )

    database_url = os.environ.get("DATABASE_URL", "")
    create_tables = os.environ.get("CREATE_TABLES", "0") == "1"
    sync_interval_hours = int(os.environ.get("SYNC_INTERVAL_HOURS", 24))

    # 1. Wait for Redis
    r = redis.StrictRedis(
        host=os.environ.get("REDIS_QUEUE_HOST", "localhost"),
        port=int(os.environ.get("REDIS_QUEUE_PORT", 6379)),
        db=int(os.environ.get("REDIS_QUEUE_DB", 0)),
    )
    _wait_for_redis(r)
    log.info("Redis ready")

    # 2. Wait for PostgreSQL and apply migrations
    if database_url:
        _wait_for_postgres(database_url)
        log.info("PostgreSQL ready")
        if create_tables:
            log.info("Applying migrations...")
            _apply_migrations(database_url)

    # 3. Start Flask API subprocess
    flask_proc = Process(target=_run_flask, name="flask-api", daemon=True)
    flask_proc.start()
    log.info("Flask API started (pid=%d)", flask_proc.pid)

    # 4. Start RQ worker subprocess
    worker_proc = Process(target=_run_worker, name="rq-worker", daemon=True)
    worker_proc.start()
    log.info("RQ worker started (pid=%d)", worker_proc.pid)

    # 5. Schedule periodic sync
    queue = Queue('pipeline2', connection=r)
    if sync_interval_hours > 0:
        schedule.every(sync_interval_hours).hours.do(_enqueue_sync, queue)
        log.info("Sync scheduled every %d hour(s)", sync_interval_hours)
    else:
        log.info("Scheduled sync disabled (SYNC_INTERVAL_HOURS=0)")

    # Scheduler loop — also watches for crashed subprocesses
    try:
        while True:
            schedule.run_pending()
            time.sleep(30)

            if not flask_proc.is_alive():
                log.warning("Flask process exited (code=%s), restarting", flask_proc.exitcode)
                flask_proc = Process(target=_run_flask, name="flask-api", daemon=True)
                flask_proc.start()

            if not worker_proc.is_alive():
                log.warning("Worker process exited (code=%s), restarting", worker_proc.exitcode)
                worker_proc = Process(target=_run_worker, name="rq-worker", daemon=True)
                worker_proc.start()

    except KeyboardInterrupt:
        log.info("Shutting down")
        flask_proc.terminate()
        worker_proc.terminate()
        flask_proc.join(timeout=5)
        worker_proc.join(timeout=5)


if __name__ == "__main__":
    main()
