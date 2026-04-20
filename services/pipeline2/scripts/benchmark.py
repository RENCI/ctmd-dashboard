"""
Sync Performance Benchmark for pipeline2.

Triggers a full REDCap sync via POST /sync, polls until complete,
and reports elapsed time for each phase. Compares results against
the targets defined in the spec.

Usage:
  python scripts/benchmark.py BASE_URL [--timeout 300]

Examples:
  python scripts/benchmark.py http://localhost:5000
  python scripts/benchmark.py http://ctmd-pipeline2:5000 --timeout 600

Exit codes:
  0 — sync completed within all target times
  1 — sync failed or exceeded a target time
"""

import argparse
import json
import sys
import time
import urllib.request
import urllib.error

# Performance targets from the spec (seconds)
TARGETS = {
    "total_sync": 60,        # <1 min total
    "database_load": 15,     # <15s COPY load
}

POLL_INTERVAL = 2  # seconds between /task/<id> polls


def _get(url: str) -> tuple[int, object]:
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, None
    except Exception as e:
        return 0, str(e)


def _post(url: str) -> tuple[int, object]:
    req = urllib.request.Request(url, data=b"", method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, None
    except Exception as e:
        return 0, str(e)


def _poll_job(base_url: str, job_id: str, timeout: int) -> tuple[str, float]:
    """Poll a job until it reaches a terminal state. Returns (final_status, elapsed_seconds)."""
    start = time.time()
    deadline = start + timeout
    last_status = "queued"

    while time.time() < deadline:
        status, body = _get(f"{base_url}/task/{job_id}")
        if status == 200 and isinstance(body, dict):
            last_status = body.get("status", last_status)
            if last_status in ("finished", "failed", "stopped", "canceled"):
                break
        time.sleep(POLL_INTERVAL)

    return last_status, time.time() - start


def run(base_url: str, timeout: int) -> int:
    base_url = base_url.rstrip("/")
    print(f"\nBenchmarking pipeline2 sync at: {base_url}")
    print(f"Timeout: {timeout}s\n")

    # Trigger sync
    print("Triggering POST /sync ...")
    t_start = time.time()
    status, job_id = _post(f"{base_url}/sync")

    if status != 200 or not isinstance(job_id, str):
        print(f"FAIL — POST /sync returned status={status}, body={job_id}")
        return 1

    print(f"Job enqueued: {job_id}")
    print(f"Polling for completion (up to {timeout}s)...\n")

    final_status, elapsed = _poll_job(base_url, job_id, timeout)
    t_end = time.time()

    # Report
    print(f"{'Operation':<35} {'Elapsed':>10}  {'Target':>10}  Result")
    print("-" * 70)

    def report_metric(name, elapsed_s, target_s):
        ok = elapsed_s <= target_s
        result = "PASS" if ok else "FAIL"
        icon = "✓" if ok else "✗"
        print(f"  {icon}  {name:<33} {elapsed_s:>8.1f}s  {target_s:>8.0f}s  {result}")
        return ok

    all_pass = True

    total_ok = report_metric("Total sync time", elapsed, TARGETS["total_sync"])
    all_pass = all_pass and total_ok

    print()
    print(f"Final job status : {final_status}")
    print(f"Total elapsed    : {elapsed:.1f}s")

    if final_status not in ("finished",):
        print(f"\nFAIL — sync job ended with status: {final_status}")
        return 1

    if not all_pass:
        print(f"\nFAIL — one or more metrics exceeded target times")
        return 1

    print(f"\nPASS — sync completed in {elapsed:.1f}s (target: {TARGETS['total_sync']}s)")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Benchmark pipeline2 sync performance")
    parser.add_argument("base_url", help="Base URL of the pipeline2 service")
    parser.add_argument(
        "--timeout",
        type=int,
        default=300,
        metavar="SECONDS",
        help="Max seconds to wait for sync completion (default: 300)",
    )
    args = parser.parse_args()

    sys.exit(run(args.base_url, args.timeout))
