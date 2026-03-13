# Pipeline Rebuild Specification

## Revision History

| Date | Author | Description |
|------|--------|-------------|
| 2026-02-14 | J. Seals / Claude | Initial specification |
| 2026-03-12 | J. Seals / Claude | Simplified: remove DSL/dynamic parsing approach |
| 2026-03-13 | J. Seals / Claude | Add CSV upload path (two independent data paths) |

## 1. Background & Motivation

The CTMD pipeline currently spans 3 languages (Python, Haskell, Scala) and 3 build systems (pip, Stack, SBT). The goal is a **full Python rewrite** that eliminates all Haskell, Scala, and Spark dependencies and simplifies everything possible.

**Two key simplifications drive the approach:**

1. **Static schema, not dynamic generation.** The Haskell service regenerated the DB schema from `mapping.json` on every deployment. We generate a static SQL migration file once and commit it. The pipeline never parses `mapping.json` at runtime.

2. **No DSL parser.** The Scala pipeline used a combinator DSL to dynamically evaluate field expressions. The Python pipeline uses explicit, direct field mappings — simple, readable Python instead of an expression evaluator.

### 1.1 Current Architecture (To Be Replaced)

The pipeline has two independent data paths that must both be rewritten:

```
PATH A — REDCap Sync (automated, scheduled)
─────────────────────────────────────────────────────────────
REDCap API
    │
    ▼
[Python: utils.py] ─── Download ALL records (every field) as JSON
    │
    ▼
[Scala/Spark: map-pipeline] ─── DSL parser, name parser, filters → CSV per table
    │
    ▼
[Haskell: map-pipeline-schema] ─── Parse mapping.json → CREATE TABLE SQL at runtime
    │
    ▼
[Python: reload.py] ─── csvsql row-by-row INSERT (DELETE all → INSERT all, no transactions)
    │
    ▼
PostgreSQL (18 tables populated from REDCap)

PATH B — CSV Upload API (user-driven)
─────────────────────────────────────────────────────────────
Dashboard User
    │  (CSV or JSON file upload)
    ▼
[Python: server.py Flask API]
    PUT /table/<name>  → csvsql DELETE + INSERT (latin-1, no transactions)
    POST /table/<name> → csvsql INSERT (append, latin-1)
    ▼
PostgreSQL (~19 tables populated by user uploads)

Both paths share:
    PostgreSQL ◄──── [Node.js API: pg-promise raw SQL] ──── React Frontend
```

**The two paths are independent:** REDCap sync never writes to CSV-managed tables.
CSV uploads never conflict with the sync. This is preserved in the rewrite.

### 1.2 Problems Being Fixed

| Problem | Affects | Fix |
|---------|---------|-----|
| 3 languages, 3 build systems | Both paths | Single Python service |
| Downloads ALL REDCap fields | Path A | Request only the 149 fields in `mapping.json` |
| Dynamic schema generation on every deploy | Path A | Static SQL migration committed to git |
| DSL expression evaluator | Path A | Explicit Python field assignments per table |
| csvsql row-by-row INSERT (~100 rows/sec) | Both paths | PostgreSQL COPY (~100,000 rows/sec) |
| DELETE all → INSERT all with no transactions | Path A | Transaction-wrapped sync (database never empty on failure) |
| latin-1 encoding throughout | Both paths | UTF-8 throughout |
| SQL injection via string concatenation | Both paths | `psycopg2.sql.Identifier()` for all identifiers |
| Spark startup overhead (30s) for <100K rows | Path A | Eliminated entirely |
| 8GB memory requirement for Spark | Path A | ~1GB for pure Python |

---

## 2. Target Architecture

```
PATH A — REDCap Sync (automated, scheduled)
───────────────────────────────────────────────────────────────────
REDCap API
    │
    ▼
[Python: redcap_importer/downloader.py]
    Batch fetch — 149 targeted fields only
    │
    ▼
[Python: transformer/transforms.py]
    Direct field mapping: REDCap JSON → per-table row dicts
    │
    ▼
[Python: loader/loader.py]
    Transaction: TRUNCATE REDCap-sourced tables → COPY all → commit
    │
    ▼
PostgreSQL (18 REDCap-sourced tables)

PATH B — CSV Upload API (user-driven)
───────────────────────────────────────────────────────────────────
Dashboard User (CSV or JSON file upload)
    │
    ▼
[Python: server.py — Flask REST API]
    PUT /table/<name>       → replace table via COPY (DELETE + COPY)
    POST /table/<name>      → append to table via COPY
    POST /table/<name>/column/<col> → partial column update
    POST /sync              → enqueue manual REDCap sync (Path A)
    POST/GET /backup        → pg_dump backup
    POST /restore/<ts>      → pg_dump restore
    GET/DELETE /task/<id>   → RQ task status
    │  (long-running ops enqueued via Redis/RQ)
    ▼
PostgreSQL (~19 CSV-managed tables)

Shared infrastructure:
    PostgreSQL ◄──── [Node.js API — unchanged] ──── React Frontend
    Redis ◄──── RQ Worker (task queue for both paths)
    Sherlock (distributed lock — prevents concurrent syncs)
```

### 2.1 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Static schema migrations | Schema rarely changes; version-controlled SQL is simpler and auditable |
| Targeted REDCap field extraction | Only the 149 fields needed; eliminates 8,800+ unnecessary fields |
| Explicit field mapping (no DSL) | Readable, debuggable, no parser complexity |
| PostgreSQL COPY for bulk loading | 100-1000x faster than csvsql row-by-row INSERT (both paths) |
| Transaction-wrapped sync (Path A only) | Database never left empty on failure |
| Two independent write paths preserved | REDCap sync and CSV uploads never interfere with each other |
| CSV upload COPY replaces csvsql | Same performance improvement for user uploads |
| UTF-8 throughout | Correct handling of non-ASCII names and values (both paths) |
| `psycopg2.sql.Identifier()` | Prevents SQL injection on table/column names (both paths) |
| Single-stage Python image | Remove JVM, Spark, Haskell, csvkit, SBT, Stack |

---

## 3. Module Breakdown

### 3.1 `redcap_importer/` — REDCap Extraction (Done)

**`mapping.py`** — Parse `mapping.json` at dev-time to extract the list of REDCap fields needed. Returns 149 sorted field names. Used by the downloader and by `schema/generator.py` — **not called at pipeline runtime**.

**`downloader.py`** — REDCap API client. Uses the field list from `mapping.py` to request only needed fields. Batched by proposal ID (configurable batch size via `REDCAP_BATCH_SIZE` env var).

### 3.2 `schema/` — Schema Generation (Done)

**`generator.py`** — One-time script: reads `mapping.json`, produces `migrations/001_initial_schema.sql`. Run once, commit the output. Never called at runtime.

**`migrations/001_initial_schema.sql`** — Committed static SQL. Applied by the migration runner at pipeline startup.

### 3.3 `transformer/` — ETL Transformation

Direct Python mapping from REDCap record JSON to per-table row dicts. No dynamic expression evaluation. Each table has a clear, explicit transformation function.

Handles the expression patterns found in `mapping.json`:

| Pattern | Python Implementation |
|---------|----------------------|
| `"field_name"` | `record.get("field_name")` |
| `"field1/field2"` | `record.get("field1") or record.get("field2")` (coalesce) |
| `"extract_first_name(pi_name/pi_name_2)"` | `nameparser` library with fallback |
| `"extract_last_name(pi_name/pi_name_2)"` | `nameparser` library with fallback |
| `"generate_ID(pi_firstname,pi_lastname)"` | deterministic hash of field combination |
| `"if x="1" then a else b"` | explicit `if/else` per conditional |
| checkbox `field___1`, `field___2` | collect checked values → junction table rows |

### 3.4 `loader/` — Database Loading

**`loader.py`** — Two responsibilities:

**Migration runner:** reads `migrations/*.sql` in order, tracks applied files in a
`schema_migrations` table, skips already-applied. Runs at startup when `CREATE_TABLES=1`.

**Atomic sync (Path A — REDCap-sourced tables only):**
1. Connect to PostgreSQL (psycopg2, UTF-8)
2. In a single transaction: TRUNCATE the 18 REDCap-sourced tables (FK-safe order) → COPY all data
3. Commit or rollback on failure — **CSV-managed tables are never touched by this operation**

Uses `psycopg2.sql.Identifier()` for all table/column names.

### 3.5 `server.py` — Flask CSV Upload API (Path B)

Preserves all existing endpoints with improved internals. Handles user-uploaded CSV and
JSON files for the ~19 tables not populated by REDCap sync.

| Endpoint | Method | Action |
|----------|--------|--------|
| `/table/<name>` | GET | Read all rows |
| `/table/<name>` | PUT | Replace table (DELETE + COPY from upload) |
| `/table/<name>` | POST | Append to table (COPY from upload) |
| `/table/<name>/column/<col>` | POST | Partial column update |
| `/backup` | GET / POST | List backups / trigger pg_dump |
| `/backup/<ts>` | DELETE | Delete backup |
| `/restore/<ts>` | POST | Restore from backup |
| `/sync` | POST | Enqueue manual REDCap sync |
| `/task` | GET | List RQ task queue status |
| `/task/<id>` | GET / DELETE | Get status / cancel task |

Changes from current `server.py`:
- Replace `csvsql` subprocess with `psycopg2` COPY
- Replace `latin-1` with UTF-8
- Replace `checkId()` string check with `sql.Identifier()`
- Accept CSV and JSON uploads (same behavior as current)
- Keep RQ enqueue pattern for long-running operations (backup, restore, sync, table writes)

### 3.6 `main.py` — Orchestration

Top-level entrypoint:
1. Read env vars (REDCAP_URL_BASE, REDCAP_APPLICATION_TOKEN, DATABASE_URL, etc.)
2. Run migrations
3. Download REDCap data
4. Transform
5. Load to PostgreSQL
6. Log row counts per table

---

## 4. What Is Removed vs. Kept vs. Added

| Removed | Kept | Added |
|---------|------|-------|
| Haskell (map-pipeline-schema) | Flask REST API (server.py) | Static SQL migrations |
| Scala/Spark (map-pipeline) | Redis/RQ task queue | Targeted REDCap extraction |
| Java runtime, 8GB Spark memory | Sherlock distributed locking | PostgreSQL COPY bulk loading |
| SBT, Stack build systems | PostgreSQL database | Transaction-safe sync |
| csvsql (csvkit) | `mapping.json` (read-only reference) | UTF-8 throughout |
| Dynamic schema generation | Backup/restore (pg_dump/psql) | `psycopg2.sql` identifier safety |
| DSL expression evaluator | Scheduling (schedule library) | Simple explicit field mapping |
| Multi-stage Docker build | Docker/Kubernetes deployment | Single-stage Python image |
| latin-1 encoding | All API endpoints | |

---

## 5. Rollback Strategy

Until the Python pipeline is validated against production data, keep the old pipeline available via env var flags:

- `USE_SPARK_ETL=1` → falls back to `spark-submit` path
- `USE_CSVSQL=1` → falls back to csvsql loading

Once output equivalence is confirmed (see Section 6), remove the old code paths.

---

## 6. Definition of Done

The pipeline rebuild is complete when:

**Path A — REDCap Sync:**
1. Pipeline starts, applies migrations, downloads from REDCap (targeted fields only), transforms, and loads — entirely in Python
2. No Haskell, Scala, Java, or Spark dependencies at runtime
3. All 18 REDCap-sourced tables populated with correct data
4. Total sync time under 1 minute (vs. current ~5 minutes)
5. Failed sync does not leave database empty (transaction rollback verified)
6. Output equivalence test passes: Python pipeline row counts match Spark pipeline for same input

**Path B — CSV Upload API:**
7. All existing Flask endpoints (`/table`, `/backup`, `/restore`, `/sync`, `/task`) return the same response format as current `server.py`
8. CSV and JSON uploads write correctly via COPY (not csvsql)
9. UTF-8 data (non-ASCII names, international characters) stored without corruption

**Infrastructure:**
10. Docker image builds as single-stage Python image
11. Helm deployment works on KiND cluster
12. `name` table lookups resolve correctly for all 15+ categories used by the Node.js API

---

## 7. Environment Variables

| Variable | Required | Used By | Description |
|----------|----------|---------|-------------|
| `REDCAP_URL_BASE` | Yes | Path A | REDCap API base URL |
| `REDCAP_APPLICATION_TOKEN` | Yes | Path A | REDCap API token |
| `REDCAP_BATCH_SIZE` | No | Path A | Records per API request (default: 50) |
| `DATABASE_URL` | Yes | Both | PostgreSQL connection string |
| `MAPPING_PATH` | No | Path A | Path to mapping.json (default: `/data/mapping.json`) |
| `CREATE_TABLES` | No | Both | Set to `1` to apply migrations on startup |
| `SYNC_INTERVAL_HOURS` | No | Path A | Hours between scheduled syncs (default: 24) |
| `REDIS_QUEUE_HOST` | Yes | Both | Redis hostname for RQ task queue |
| `REDIS_QUEUE_PORT` | Yes | Both | Redis port (default: 6379) |
| `REDIS_QUEUE_DB` | Yes | Both | Redis DB index |
| `TASK_TIME` | No | Both | Max RQ job timeout in seconds |
| `LOCAL_ENV` | No | Path B | Set to `true` to enable CORS (local development) |
| `BACKUP_DIR` | No | Path B | Directory for pg_dump backup files |
| `USE_SPARK_ETL` | No | Path A | Set to `1` to fall back to old Spark pipeline |
| `USE_CSVSQL` | No | Both | Set to `1` to fall back to csvsql loading |
