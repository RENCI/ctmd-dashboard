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

**Done (Week 1):**
- `transformer/transforms.py` — direct Python mapping from REDCap record dicts to per-table row dicts; handles all 7 expression patterns from mapping.json
- `transformer/__init__.py`
- `tests/test_transforms.py` — 36 tests, all passing
- `loader/loader.py` (Part 1) — migration runner with `schema_migrations` tracking table
- `loader/__init__.py`
- `tests/test_loader.py` — 27 tests (migration runner + COPY sync), all passing

**Done (Week 2):**
- `loader/loader.py` (Part 2) — transaction-wrapped COPY sync (TRUNCATE → COPY → commit/rollback); `psycopg2.sql.Identifier()` for all names; UTF-8 throughout
- `server.py` — Flask CSV Upload API; all 11 endpoints; `create_app()` factory pattern; module-level RQ worker functions; replaces `csvsql` with `psycopg2 COPY`, `latin-1` with UTF-8, `checkId()` with `sql.Identifier()`
- `tests/test_server.py` — 31 tests via injectable `FakeQueue` (no real Redis required), all passing
- `requirements.txt` — complete dependency list (10 packages; replaces JVM + Spark + Haskell + csvkit)

**Test summary (all branches):**
- 115 tests passing across `test_mapping.py` (21), `test_transforms.py` (36), `test_loader.py` (27), `test_server.py` (31)
- 13 pre-existing errors in `test_schema_generator.py` — `FileNotFoundError: /data/mapping.json` (file only exists in Docker container; not caused by current work)

**Active branch:** `ctmd-125-pipeline-loader`

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

## Week 1 — REDCap ETL Core ✓ Done

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
- `transformer/__init__.py` ✓
- `transformer/transforms.py` ✓
- `tests/test_transforms.py` ✓ (36 tests, all passing)

### `loader/loader.py` (Part 1 — Migration Runner)

Simple migration runner: reads `migrations/*.sql` files in order, tracks applied
migrations in a `schema_migrations` table, skips already-applied files.

Deliverables:
- `loader/__init__.py` ✓
- `loader/loader.py` (migration runner only) ✓
- `tests/test_loader.py` (migration tests) ✓

**Acceptance criteria:**
- All transforms produce correct output for synthetic input data ✓
- Migration runner creates all 42 tables + `schema_migrations` tracking table ✓
- Idempotent: running migrations twice does not error ✓

---

## Week 2 — Bulk Loader + CSV Upload API ✓ Done

### `loader/loader.py` (Part 2 — COPY Sync)

Transaction-wrapped bulk sync for REDCap-sourced tables:
1. TRUNCATE all REDCap-sourced tables (in FK-safe order)
2. COPY each table from in-memory data
3. Commit all or rollback all — database never left empty

Uses `psycopg2.sql.Identifier()` for all table/column names (replaces `checkId()`).
UTF-8 throughout.

Deliverables:
- `loader/loader.py` (complete: migrations + COPY sync) ✓
- `tests/test_loader.py` (transaction rollback tests added) ✓ (27 tests total, all passing)

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
- `server.py` ✓
- `tests/test_server.py` ✓ (31 tests, all passing)

**Acceptance criteria:**
- All existing API endpoints return same response format ✓
- PUT replaces table data correctly ✓
- POST appends correctly ✓
- Backup/restore ops enqueue successfully ✓

---

## Week 3 — Orchestration + Infrastructure ✓ Done

### `server.py` — Pipeline Entry Point

Delivered as a single `server.py` (not `main.py` as originally planned). Startup sequence:
1. Wait for Redis + PostgreSQL readiness
2. Apply pending migrations (`CREATE_TABLES=1`)
3. Start Flask API server (subprocess, pid 7)
4. Start RQ worker (subprocess, pid 8) — queue name `pipeline2`
5. Start sync scheduler — interval via `SYNC_INTERVAL_HOURS`

Sync loop:
- Sherlock distributed lock on Redis DB 2 (DB 1 reserved for old pipeline — prevents concurrent lock conflicts in blue/green mode)
- Scheduled interval (default: 24h)
- Manual trigger via `POST /sync` → returns RQ job ID

Deliverables:
- `server.py` ✓
- `transformer/name_table.py` ✓ — generates `name` table from REDCap data dictionary (`content=metadata`); handles conditional field expressions (`if X="Y" then...`)
- `scripts/compare_tables.py` ✓ — intersection-based comparison tool for validating pipeline2 output against old pipeline

### Dockerfile ✓

Single-stage `python:3.12-slim` image. Builds for `linux/amd64` (required for Kubernetes on arm64 Mac dev machines via `--platform linux/amd64`).

### Helm + CI/CD Updates ✓

- `helm-charts/ctmd-dashboard/templates/pipeline2.yaml` — pipeline2 Deployment + Service; conditional DB reference (`pipeline2.postgres.create` flag)
- `helm-charts/ctmd-dashboard/templates/db-pipeline2.yaml` — dedicated PostgreSQL (ctmd-db2) for blue/green mode; own Secret, PVC, Deployment, Service
- `helm-charts/ctmd-dashboard/values.yaml` — `pipeline2.*` section with blue/green documentation, `REDIS_LOCK_DB: "2"`
- `.github/workflows/build-release.yml` — added `Build-Pipeline2` step; all services now tagged with same semver on merge to main
- `.github/workflows/build-pipeline2.yml` — per-branch build on `services/pipeline2/**` changes

---

## Week 4 — Testing & Cutover ✓ Done

### Output Equivalence Test ✓

Ran `scripts/compare_tables.py` against prod (old pipeline, 665 proposals) and stage (pipeline2, 745 proposals). Results:

- **5/18 tables matched exactly** (all junction/checkbox tables)
- **13 tables differed** — all differences classified as intentional improvements:
  1. **UTF-8 encoding** — old pipeline had latin-1 mojibake; pipeline2 has correct UTF-8
  2. **Data drift** — REDCap updated since old pipeline ran; proposal count increased 665 → 746
  3. **FinalRecommendation** — old pipeline had 1.65 rows/proposal (duplicates from Spark join); pipeline2 has exactly 1
  4. **userId** — old uses `monotonically_increasing_id()` (non-deterministic Spark); pipeline2 uses deterministic MD5 hash

### Performance Results ✓

| Operation | Old Pipeline | Pipeline2 |
|-----------|-------------|-----------|
| REDCap download | ~30s (all fields) | ~55s (75 batches × 10 proposals, 147 fields) |
| ETL + load | ~4 min (Spark startup + csvsql) | ~9s (Python + COPY) |
| **Total sync** | **~5 min** | **~64 seconds** |

### Production Cutover ✓ (2026-04-28)

1. **Blue/green deployment**: `pipeline2.create: true`, `pipeline2.postgres.create: true` — pipeline2 deployed alongside old pipeline with isolated `ctmd-db2`
2. **Manual sync triggered**: 746 proposals loaded in 64 seconds
3. **Frontend cutover**: `REACT_APP_DATA_API_ROOT` → `http://ctmd-pipeline2:5000/`
4. **Old pipeline decommissioned**: `pipeline.create: false` — pod terminated, CPU quota freed

Deployed image tags: `v0.1.4` → `v0.1.5` → `v0.1.6` → `v0.1.7` → `v0.1.8` → `v0.1.9` → `v0.1.10` (prod)

---

## Summary

| Week | Focus | Deliverable | Status |
|------|-------|-------------|--------|
| 0 | Field manifest, schema generation | mapping.py, downloader.py, generator.py, migration SQL | ✓ Done |
| 1 | REDCap transforms + migration runner | transformer/, loader/ (migrations), test_transforms.py | ✓ Done |
| 2 | Bulk loader + CSV upload API | loader/ (COPY sync), server.py, test_server.py, requirements.txt | ✓ Done |
| 3 | Orchestration + infrastructure | server.py, name_table.py, Dockerfile, Helm templates, CI/CD | ✓ Done |
| 4 | Testing + cutover | Equivalence validation, prod blue/green deployment, decommission | ✓ Done |

**Actual delivery: ~10 weeks** (including staging validation, bug fixes, and blue/green infrastructure)

---

## Risk: `name` Table ✓ Resolved

The `name` lookup table is generated from the REDCap data dictionary (`content=metadata` API call) in `transformer/name_table.py`. Prod result: **752 rows** covering 17 tables.

A bug was found and fixed during staging: `_base_field_name()` was returning `None` for conditional expressions (`if ko_meeting="1" then kick_off_scheduled else "N/A"`), causing `InitialConsultationDates` entries to be excluded. Fixed by extracting the condition field name (`ko_meeting`) via regex.

---

## Outstanding Items

See `spec/pipeline/pipeline-rebuild-spec.md` Section 9 for the full outstanding items list.

**🔴 HIGH PRIORITY:** The Node.js API (`ctmd-api`) still connects to `ctmd-db` (old pipeline database). Proposal data served by the Node.js API is stale; CSV-managed user data also lives in `ctmd-db`. Migration path: export CSV tables from `ctmd-db` → `ctmd-db2`, update API secret reference, decommission `ctmd-db`.
