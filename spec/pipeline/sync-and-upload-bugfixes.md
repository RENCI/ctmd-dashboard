# pipeline2 Sync & Upload Bugfixes (ctmd-165)

> **Status: implemented on branch `ctmd-165` (2026-07-24)** — not yet merged.
>
> - Scheduled REDCap sync crashed daily (arg mismatch) → stale data — fixed
> - Study Site / Study Profile uploads silently failed on real-world CSVs — fixed
> - Stale prod data recovered by triggering a manual sync
> - Regression + sanitization tests added; frontend smoke tests extended

## Problem Statement

Reported by Ryan Majkowski:

1. Uploaded Study Site data does not appear in the Studies List, and previously
   uploaded data is gone.
2. The "Submissions By Month" visualization is flat, even though there have
   been recent proposal submissions.

Both are "recent data not appearing." They have **two distinct root causes**,
both in `services/pipeline2`.

## Bug B — Submissions By Month flat / all proposal data stale

### Root cause

The scheduled REDCap sync had been failing **every day since commit `e521467`**.
That commit changed the worker signature from
`_run_sync(database_url, mapping_path)` to `_run_sync(mapping_path)` (it now
reads `DATABASE_URL` from the environment) and updated the manual `POST /sync`
route — but missed the scheduler in `main.py`:

```python
# services/pipeline2/main.py  (_enqueue_sync)
queue.enqueue(_run_sync, database_url, mapping_path, job_timeout=task_time)
```

Every scheduled run crashed with:

```
TypeError: _run_sync() takes 1 positional argument but 2 were given
```

Confirmed in the pod logs — one such failure per day. No REDCap data had loaded
since ~2026-04-26, so `Proposal.dateSubmitted` stopped in April and the
by-month chart was flat for every month after. (A separately-investigated
"missing SQL alias" theory was **disproved**: PostgreSQL names
`CAST("Proposal"."dateSubmitted" AS VARCHAR)` after its underlying column, so
the API does return a `dateSubmitted` field.)

The manual `POST /sync` route was unaffected (it already passed one arg), which
is why manual syncs worked and how the stale data was recovered.

### Fix

`main.py:_enqueue_sync` now enqueues `_run_sync(mapping_path)` (one arg).
`tests/test_scheduler.py` binds the enqueued args against the real `_run_sync`
signature so the mismatch cannot silently return.

### Recovery

Triggered a manual sync (`POST /data/sync`) against prod. Proposal count went
746 → 768, newest `dateSubmitted` 2026-04-26 → 2026-07-22, and May/June/July
buckets populated. `StudySites`/`StudyProfile` are not in `REDCAP_TABLES`, so
the sync did not touch uploaded data.

## Bug A — Study Site uploads silently fail

### Root cause

Real upload CSVs (spreadsheet exports) contain values Postgres `COPY` rejects:

- `"n/a"` in `date` columns (e.g. `dateContractSent`)
- `"186.00"` in `bigint` columns (e.g. `patientsConsentedCount`)
- blank / empty key cells (empty `siteId`)

The upload endpoint (`POST /table/<table>/column/<column>`) validated only
column **names**, then enqueued the write and returned **HTTP 200** with a job
id. The `_update_column` DELETE+COPY ran asynchronously and failed on the bad
values. Because the failure happened after the 200 response — and the job even
caught the exception and returned `False` (logged by RQ as "Job OK") — the
frontend `DropZone` showed **"File uploaded!"** while nothing landed. This is
why Ryan believed data was uploaded and then "disappeared": those uploads never
persisted. (`_update_column` is atomic — `autocommit=False`, single
transaction, rollback on error — so a failed upload does **not** delete prior
rows.)

### Fix

Added type-aware sanitization that runs **synchronously in the request handler**
(`services/pipeline2/server.py`):

- `_get_column_types()` reads `information_schema` for the target table.
- `_coerce_value()` maps null-like tokens (`""`, `n/a`, `na`, `null`, `none`,
  `nan`, `-`, `.`) → SQL NULL; coerces spreadsheet floats like `186.00` → `186`
  for integer columns; passes dates/strings through.
- `_sanitize_rows()` coerces every cell, drops rows missing a key value
  (reported as a warning), and collects uncoercible cells as errors.
- Both upload routes now sanitize before enqueuing. If any cell is genuinely
  uncoercible, the route returns **400** with per-cell messages
  (`Row 3, column 'patientsConsentedCount': 'abc' is not a valid integer`),
  which `DropZone` already renders. Messy-but-valid files now load; genuinely
  bad files are rejected loudly instead of silently.

The DB lookup is wrapped so a metadata hiccup falls back to the previous
behavior rather than blocking uploads.

### Tests

- `tests/test_server.py`: `TestCoerceValue`, `TestSanitizeRows` cover Ryan's
  exact failing values.
- End-to-end (verified during development against a local Postgres with the
  real schema): a CSV with `n/a`/`186.00`/empty-key returns 200 and lands the
  coerced rows; a CSV with `not-a-number` returns 400 and lands nothing.

## Smoke Tests

Extended `services/frontend/smoke-tests/` (see
`spec/services/frontend/frontend-bugfixes-and-smoke-testing.md`) with guards for
these bugs:

- **Home: Submissions By Month renders (not the empty state)** — catches a
  fully-empty chart.
- **Proposal data is fresh (sync not stuck)** — `GET /api/proposals`, asserts
  the newest `dateSubmitted` is within `SMOKE_FRESHNESS_DAYS` (default 120).
  Directly catches a stuck sync; the real incident was ~90 days stale.
- **StudySites upload rejects malformed data** — POSTs a CSV with a non-numeric
  integer and asserts a 400 (nothing persists). Skips if pipeline2 `/data`
  isn't reachable.

## Deployment

Code fixes require a new `ctmd-pipeline2` image. The scheduled sync in the
running pod stays broken until then (data is current thanks to the manual sync).
Ship via the normal path: merge `ctmd-165` → CI builds `pipeline2` → `helm
upgrade`. After deploy, confirm the scheduler logs `sync complete` (not the
TypeError) at the next interval.
