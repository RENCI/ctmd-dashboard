# Pipeline Rebuild Specification

## Revision History

| Date | Author | Description |
|------|--------|-------------|
| 2026-02-14 | J. Seals / Claude | Initial specification |
| 2026-03-12 | J. Seals / Claude | Simplified: remove DSL/dynamic parsing approach |

## 1. Background & Motivation

The CTMD pipeline currently spans 3 languages (Python, Haskell, Scala) and 3 build systems (pip, Stack, SBT). The goal is a **full Python rewrite** that eliminates all Haskell, Scala, and Spark dependencies and simplifies everything possible.

**Two key simplifications drive the approach:**

1. **Static schema, not dynamic generation.** The Haskell service regenerated the DB schema from `mapping.json` on every deployment. We generate a static SQL migration file once and commit it. The pipeline never parses `mapping.json` at runtime.

2. **No DSL parser.** The Scala pipeline used a combinator DSL to dynamically evaluate field expressions. The Python pipeline uses explicit, direct field mappings — simple, readable Python instead of an expression evaluator.

### 1.1 Current Architecture (To Be Replaced)

```
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
PostgreSQL ◄──── [Node.js API: pg-promise raw SQL] ──── React Frontend
```

### 1.2 Problems Being Fixed

| Problem | Fix |
|---------|-----|
| 3 languages, 3 build systems | Single Python service |
| Downloads ALL REDCap fields | Request only the 149 fields in `mapping.json` |
| Dynamic schema generation on every deploy | Static SQL migration committed to git |
| DSL expression evaluator | Explicit Python field assignments per table |
| csvsql row-by-row INSERT (~100 rows/sec) | PostgreSQL COPY (~100,000 rows/sec) |
| DELETE all → INSERT all with no transactions | Transaction-wrapped sync (database never empty on failure) |
| latin-1 encoding throughout | UTF-8 throughout |
| SQL injection via string concatenation | `psycopg2.sql.Identifier()` for all identifiers |
| Spark startup overhead (30s) for <100K rows | Eliminated entirely |
| 8GB memory requirement for Spark | ~1GB for pure Python |

---

## 2. Target Architecture

```
REDCap API
    │
    ▼
[Python: redcap_importer/]
    downloader.py ─── Batch fetch targeted fields only (149 fields from mapping.json)
    │
    ▼
[Python: transformer/]
    transforms.py ─── Direct field mapping: REDCap JSON → per-table dicts
    │
    ▼
[Python: loader/]
    loader.py ─── PostgreSQL COPY, transaction-wrapped, UTF-8
    │
    ▼
PostgreSQL ◄──── [Node.js API — unchanged] ──── React Frontend
```

### 2.1 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Static schema migrations | Schema rarely changes; version-controlled SQL is simpler and auditable |
| Targeted REDCap field extraction | Only the 149 fields needed; eliminates 8,800+ unnecessary fields |
| Explicit field mapping (no DSL) | Readable, debuggable, no parser complexity |
| PostgreSQL COPY for bulk loading | 100-1000x faster than csvsql row-by-row INSERT |
| Transaction-wrapped sync | Database never left empty on failure |
| UTF-8 throughout | Correct handling of non-ASCII names and values |
| `psycopg2.sql.Identifier()` | Prevents SQL injection on table/column names |
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

**`loader.py`** — Atomic sync using PostgreSQL COPY:
1. Connect to PostgreSQL (psycopg2, UTF-8)
2. Run pending migrations
3. In a single transaction: TRUNCATE all tables → COPY all data
4. Commit or rollback on failure

Uses `psycopg2.sql.Identifier()` for all table/column names.

### 3.5 `main.py` — Orchestration

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

1. Pipeline starts, applies migrations, downloads from REDCap (targeted fields only), transforms, and loads into PostgreSQL — entirely in Python
2. No Haskell, Scala, Java, or Spark dependencies at runtime
3. All 19 tables queried by the API are populated with correct data
4. All API endpoints return correct data
5. Total sync time under 1 minute (vs. current ~5 minutes)
6. Failed sync does not leave database empty (transaction rollback verified)
7. Docker image builds as single-stage Python image
8. Helm deployment works on KiND cluster
9. Output equivalence test passes: Python pipeline row counts match Spark pipeline for same input

---

## 7. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `REDCAP_URL_BASE` | Yes | REDCap API base URL |
| `REDCAP_APPLICATION_TOKEN` | Yes | REDCap API token |
| `REDCAP_BATCH_SIZE` | No | Records per API request (default: 50) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `MAPPING_PATH` | No | Path to mapping.json (default: `/data/mapping.json`) |
| `CREATE_TABLES` | No | Set to `1` to apply migrations on startup |
| `USE_SPARK_ETL` | No | Set to `1` to fall back to old Spark pipeline |
| `USE_CSVSQL` | No | Set to `1` to fall back to csvsql loading |
