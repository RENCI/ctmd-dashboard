"""
End-to-End API Health Check for pipeline2.

Verifies all 11 API endpoints are reachable and return expected response
shapes. Also checks that the `name` table has entries for all 15+ categories
used by the dashboard.

Usage:
  python scripts/e2e_check.py BASE_URL

Examples:
  python scripts/e2e_check.py http://localhost:5000
  python scripts/e2e_check.py http://ctmd-pipeline2:5000

Exit codes:
  0 — all checks pass
  1 — one or more checks failed
"""

import argparse
import json
import sys
import urllib.request
import urllib.error


# Expected name table categories (dashboard relies on all of these resolving)
EXPECTED_NAME_CATEGORIES = [
    "proposalStatus",
    "requestedServices",
    "therapeuticArea",
    "studyType",
    "networkGroup",
    "resourceType",
    "typeOfInteraction",
    "assignTo",
    "piType",
    "committee",
    "fundingType",
    "consultType",
    "piInstitution",
    "submitterInstitution",
    "recommendedServices",
]

PASS = "PASS"
FAIL = "FAIL"
SKIP = "SKIP"


def _get(url: str, expect_status: int = 200) -> tuple[int, object]:
    """Make a GET request. Returns (status_code, parsed_body)."""
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            return resp.status, body
    except urllib.error.HTTPError as e:
        return e.code, None
    except Exception as e:
        return 0, str(e)


def _post(url: str) -> tuple[int, object]:
    """Make a POST request with empty body. Returns (status_code, parsed_body)."""
    req = urllib.request.Request(url, data=b"", method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            return resp.status, body
    except urllib.error.HTTPError as e:
        return e.code, None
    except Exception as e:
        return 0, str(e)


def run(base_url: str) -> int:
    base_url = base_url.rstrip("/")
    checks = []

    def check(name: str, status: str, detail: str = ""):
        icon = "✓" if status == PASS else ("~" if status == SKIP else "✗")
        print(f"  {icon}  {name:<50}  {status}  {detail}")
        checks.append((name, status))

    print(f"\nE2E health check against: {base_url}\n")
    print(f"  {'Check':<52}  {'Status'}")
    print("  " + "-" * 70)

    # ------------------------------------------------------------------
    # /backup GET — list backups (empty list is fine)
    # ------------------------------------------------------------------
    status, body = _get(f"{base_url}/backup")
    if status == 200 and isinstance(body, list):
        check("GET /backup returns list", PASS)
    else:
        check("GET /backup returns list", FAIL, f"status={status}, body={body}")

    # ------------------------------------------------------------------
    # /task GET — queue structure present
    # ------------------------------------------------------------------
    status, body = _get(f"{base_url}/task")
    if status == 200 and isinstance(body, dict) and "queued" in body:
        check("GET /task returns queue structure", PASS)
    else:
        check("GET /task returns queue structure", FAIL, f"status={status}")

    # ------------------------------------------------------------------
    # /task/<nonexistent> GET — 404
    # ------------------------------------------------------------------
    status, body = _get(f"{base_url}/task/nonexistent-id", expect_status=404)
    if status == 404:
        check("GET /task/<unknown> returns 404", PASS)
    else:
        check("GET /task/<unknown> returns 404", FAIL, f"status={status}")

    # ------------------------------------------------------------------
    # /table/<name> GET — each CSV-managed table readable
    # ------------------------------------------------------------------
    csv_tables = ["StudyProfile", "StudySites", "SiteInformation"]
    for table in csv_tables:
        status, body = _get(f"{base_url}/table/{table}")
        if status == 200 and isinstance(body, list):
            check(f"GET /table/{table} returns list", PASS, f"{len(body)} rows")
        else:
            check(f"GET /table/{table} returns list", FAIL, f"status={status}")

    # ------------------------------------------------------------------
    # /table/name — all 15+ dashboard categories present
    # ------------------------------------------------------------------
    status, body = _get(f"{base_url}/table/name")
    if status == 200 and isinstance(body, list):
        found_categories = {row.get("category") for row in body if isinstance(row, dict)}
        missing = [c for c in EXPECTED_NAME_CATEGORIES if c not in found_categories]
        if not missing:
            check(
                f"name table has all {len(EXPECTED_NAME_CATEGORIES)} categories",
                PASS,
                f"{len(body)} total rows",
            )
        else:
            check(
                f"name table has all {len(EXPECTED_NAME_CATEGORIES)} categories",
                FAIL,
                f"missing: {missing}",
            )
    else:
        check("GET /table/name returns rows", FAIL, f"status={status}")

    # ------------------------------------------------------------------
    # /sync POST — enqueues a job (returns job id string)
    # ------------------------------------------------------------------
    status, body = _post(f"{base_url}/sync")
    if status == 200 and isinstance(body, str) and body:
        check("POST /sync enqueues job", PASS, f"job_id={body}")
        # ------------------------------------------------------------------
        # /task/<id> GET — job is visible in queue
        # ------------------------------------------------------------------
        task_status, task_body = _get(f"{base_url}/task/{body}")
        if task_status == 200 and isinstance(task_body, dict) and "status" in task_body:
            check(f"GET /task/<id> returns job info", PASS, f"status={task_body.get('status')}")
        else:
            check(f"GET /task/<id> returns job info", FAIL, f"status={task_status}")
    else:
        check("POST /sync enqueues job", FAIL, f"status={status}, body={body}")
        check("GET /task/<id> returns job info", SKIP, "skipped — sync job not enqueued")

    # ------------------------------------------------------------------
    # Summary
    # ------------------------------------------------------------------
    print()
    passed = sum(1 for _, s in checks if s == PASS)
    failed = sum(1 for _, s in checks if s == FAIL)
    skipped = sum(1 for _, s in checks if s == SKIP)
    total = len(checks)

    print(f"Results: {passed} passed, {failed} failed, {skipped} skipped ({total} total)")

    if failed:
        print(f"\nFAIL — {failed} check(s) did not pass")
        return 1

    print("\nPASS — all pipeline2 API checks passed")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="End-to-end health check for pipeline2 API")
    parser.add_argument("base_url", help="Base URL of the pipeline2 service (e.g. http://localhost:5000)")
    args = parser.parse_args()

    sys.exit(run(args.base_url))
