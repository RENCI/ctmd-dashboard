# Pipeline Rewrite Timeline

Reference: [pipeline-rebuild-spec.md](./pipeline-rebuild-spec.md)

---

## Current Status

**Done (Week 0):**
- `redcap_importer/mapping.py` — 149-field manifest from mapping.json (21 tests)
- `redcap_importer/downloader.py` — REDCap API client, targeted batch fetch
- `schema/generator.py` — one-time SQL generation from mapping.json
- `migrations/001_initial_schema.sql` — committed static schema (42 tables)
- `tests/test_schema_generator.py` — 19 tests (42 total, all passing)

---

## Two Parallel Concerns

Understanding this split is critical. The pipeline has **two independent data paths** that must both be rewritten:

### Path A — REDCap Sync (Automated)
Scheduled job: downloads REDCap data → transforms → bulk loads 18 tables.

Tables populated **entirely from REDCap data**:
`Proposal`, `Submitter`, `ProposalDetails`, `ProposalFunding`, `AssignProposal`,
`InitialConsultationSummary`, `ProtocolTimelines_estimated`, `PATReviewForVote`,
`BudgetBreakOut`, `RecommendationsForPI`, `TIC_RICAssessment`, `FinalRecommendation`,
`CTSA`, `StudyPI`, `Proposal_ConsultOptions`, `Proposal_NewServiceSelection`,
`Proposal_ServicesApproved`, `Proposal_ServicesPatOutcome`, `Proposal_ServicesPostOutcome`,
`Proposal_RemovedServices`

### Path B — CSV Upload API (User-Driven)
Users upload CSV/JSON files via the dashboard. The Flask API handles these writes.

Tables populated **by user CSV uploads** (not touched by REDCap sync):
`SiteInformation`, `StudyProfile`, `StudySites`, `StudyInformation`,
`EnrollmentInformation`, `UtahRecommendation`, `PATMeeting`, `InitialConsultationDates`,
`LettersAndSurvey`, `TIChealPOCs`, `Sites`, `CTSAs`, `Administrator`,
`User`, `TINuser`, `Voter`, `ServicesAdditionalInfo`, `ConsultationRequest`,
`SuggestedChanges`

> **Key point:** These two paths do not overlap. REDCap sync never writes to CSV-managed
> tables. CSV uploads never conflict with the sync. This makes both paths safe to build
> and test independently.

---

## Week 1 — REDCap ETL Core

### `transformer/transforms.py`

Direct Python mapping from REDCap record dicts to per-table row dicts. One function
per table (or group). No dynamic parsing — explicit field assignments.

Handles these expression patterns from mapping.json:

| Pattern | Python |
|---------|--------|
| `field_name` | `record.get("field_name")` |
| `field1/field2` | `record.get("field1") or record.get("field2")` |
| `extract_first_name(pi_name/pi_name_2)` | `nameparser` library |
| `extract_last_name(pi_name/pi_name_2)` | `nameparser` library |
| `generate_ID(pi_firstname,pi_lastname)` | deterministic hash |
| `if x="1" then a else b` | explicit `if/else` per field |
| checkbox `field___1`, `field___2` | collect `"1"` values → junction table rows |

Deliverables:
- `transformer/__init__.py`
- `transformer/transforms.py`
- `tests/test_transforms.py`

### `loader/loader.py` (Part 1 — Migration Runner)

Simple migration runner: reads `migrations/*.sql` files in order, tracks applied
migrations in a `schema_migrations` table, skips already-applied files.

Deliverables:
- `loader/__init__.py`
- `loader/loader.py` (migration runner only)
- `tests/test_loader.py` (migration tests)

**Acceptance criteria:**
- All transforms produce correct output for synthetic input data
- Migration runner creates all 42 tables + `schema_migrations` tracking table
- Idempotent: running migrations twice does not error

---

## Week 2 — Bulk Loader + CSV Upload API

### `loader/loader.py` (Part 2 — COPY Sync)

Transaction-wrapped bulk sync for REDCap-sourced tables:
1. TRUNCATE all REDCap-sourced tables (in FK-safe order)
2. COPY each table from in-memory data
3. Commit all or rollback all — database never left empty

Uses `psycopg2.sql.Identifier()` for all table/column names (replaces `checkId()`).
UTF-8 throughout.

Deliverables:
- `loader/loader.py` (complete: migrations + COPY sync)
- `tests/test_loader.py` (transaction rollback tests added)

### `server.py` — Flask CSV Upload API

Preserve all existing API endpoints with improved internals:

| Endpoint | Method | Action |
|----------|--------|--------|
| `/table/<name>` | GET | Read all rows from table |
| `/table/<name>` | PUT | Replace table (DELETE + COPY from CSV/JSON) |
| `/table/<name>` | POST | Append to table (COPY from CSV/JSON) |
| `/table/<name>/column/<col>` | POST | Partial column update |
| `/backup` | GET | List backups |
| `/backup` | POST | Trigger backup (pg_dump, enqueued) |
| `/backup/<ts>` | DELETE | Delete backup |
| `/restore/<ts>` | POST | Restore from backup (enqueued) |
| `/sync` | POST | Trigger manual REDCap sync (enqueued) |
| `/task` | GET | List task queue status |
| `/task/<id>` | GET | Get task status |
| `/task/<id>` | DELETE | Cancel task |

Changes from current `server.py`:
- Replace `csvsql` subprocess with `psycopg2` COPY
- Replace `latin-1` encoding with UTF-8
- Replace `checkId()` string check with `sql.Identifier()`
- Accept both CSV and JSON uploads (same as current)
- Keep RQ task queue integration for long-running operations

Deliverables:
- `server.py`
- `tests/test_server.py`

**Acceptance criteria:**
- All existing API endpoints return same response format
- PUT replaces table data correctly
- POST appends correctly
- Backup/restore ops enqueue successfully

---

## Week 3 — Orchestration + Infrastructure

### `main.py` — Pipeline Entry Point

Startup sequence:
1. Read env vars
2. Connect to Redis (RQ worker)
3. Apply pending migrations (`CREATE_TABLES=1`)
4. Start Flask API server (subprocess)
5. Start RQ worker (subprocess)
6. Start sync scheduler (schedule library)

Sync loop (same as current `application.py` + `reload.py` pattern):
- Sherlock Redis lock prevents concurrent syncs
- Scheduled interval (env var `SYNC_INTERVAL_HOURS`, default: 24)
- Manual trigger via `POST /sync`

Deliverables:
- `main.py`
- `worker.py` (RQ worker setup)

### Dockerfile

Single-stage Python image (replace current Ubuntu multi-stage build):

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

New `requirements.txt` (replaces JVM + Spark + Haskell + csvkit):
```
requests>=2.32.0
psycopg2-binary>=2.9
flask>=3.0
flask-cors>=4.0
redis>=5.0
rq>=1.16
sherlock>=0.4
schedule>=1.2
nameparser>=1.1
pytest>=8.0
```

### Helm + Makefile Updates

Helm `values.yaml` changes:
- Remove `SPARK_DRIVER_MEMORY`, `SPARK_EXECUTOR_MEMORY`
- Reduce memory request: `8Gi → 1Gi`
- Reduce CPU request: `500m → 200m`
- Add `USE_SPARK_ETL: "0"` (rollback flag)

Makefile:
- Add `build-pipeline2`, `test-pipeline2`, `push-pipeline2` targets (done)
- Update `build-all` to include pipeline2

**Acceptance criteria:**
- `make build-pipeline2` produces working image
- `helm install` deploys successfully on KiND cluster
- Pipeline starts, applies migrations, runs first sync

---

## Week 4 — Testing & Cutover

### Output Equivalence Test

Run both pipelines on the same REDCap snapshot. Diff every table:
- Row counts match
- Column values match (order-independent)
- Document any intentional differences (e.g., fixed boolean bug, UTF-8 names)

### End-to-End Test

Full pipeline on KiND cluster:
- Dashboard displays correct data when backed by Python-only pipeline
- All API endpoints return valid data
- `name` table lookups resolve for all 15+ categories
- CSV uploads work (PUT/POST to CSV-managed tables)

### Performance Benchmark

| Operation | Current Target | Python Target |
|-----------|---------------|---------------|
| Schema generation | ~5s (Haskell) | <1s |
| REDCap download | ~30s (all fields) | ~15s (149 fields) |
| ETL processing | ~40s (Spark startup) | <5s |
| Database load | ~180s (csvsql) | <15s (COPY) |
| **Total sync** | **~5 min** | **<1 min** |

### Cutover

1. Deploy pipeline2 alongside pipeline (both running)
2. Verify equivalence
3. Switch Helm to use pipeline2 image
4. Monitor for 1-2 sync cycles
5. Remove old pipeline code (Scala, Haskell, Spark JAR)

---

## Summary

| Week | Focus | Deliverable |
|------|-------|-------------|
| 0 (done) | Field manifest, schema generation | mapping.py, downloader.py, generator.py, migration SQL |
| 1 | REDCap transforms + migration runner | transformer/, loader/ (migrations) |
| 2 | Bulk loader + CSV upload API | loader/ (COPY sync), server.py |
| 3 | Orchestration + infrastructure | main.py, Dockerfile, Helm, Makefile |
| 4 | Testing + cutover | Equivalence test, E2E, benchmarks, production switch |

**Total: ~4 weeks** (assuming one developer, no blockers)

---

## Risk: `name` Table

The `name` lookup table is used by **nearly every API endpoint**. It is generated from
the REDCap **data dictionary** (field metadata), not from record data. The current Scala
pipeline generates it from `GetDataDict.scala`.

This needs dedicated handling in the transformer — the REDCap data dictionary download
is separate from the record download, and the `name` table generation logic parses
dropdown/checkbox option metadata from the dictionary.

This is likely the highest-risk item in the rewrite. It should be treated as a
standalone story within Week 1 or Week 2 with explicit validation against the current
`name` table contents before cutover.
