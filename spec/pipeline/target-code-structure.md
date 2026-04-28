# Pipeline Rebuild: Target Code Structure

Reference: [pipeline-rebuild-spec.md](./pipeline-rebuild-spec.md)

---

## Delivered Directory Layout (as of v0.1.10)

```
services/pipeline2/
├── server.py                   # Entry point: Flask API + RQ worker + scheduler
├── requirements.txt            # Python dependencies (10 packages)
├── Dockerfile                  # Single-stage Python image (python:3.12-slim, linux/amd64)
│
├── redcap_importer/
│   ├── __init__.py
│   ├── mapping.py              # Parse mapping.json → list of REDCap field names
│   └── downloader.py           # REDCap API client: targeted batch fetch; validates
│                               # fields against REDCap data dictionary on init
│
├── schema/
│   ├── __init__.py
│   └── generator.py            # One-time tool: mapping.json → CREATE TABLE SQL
│
├── migrations/
│   ├── 001_initial_schema.sql  # Committed static SQL schema (all tables)
│   └── 002_add_notable_risk.sql # ALTER TABLE ProposalDetails ADD COLUMN IF NOT EXISTS
│
├── transformer/
│   ├── __init__.py
│   ├── transforms.py           # Direct REDCap JSON → per-table row dicts (18 tables)
│   └── name_table.py           # Generates name lookup table from REDCap data dictionary
│
├── loader/
│   ├── __init__.py
│   └── loader.py               # Migration runner + TRUNCATE+COPY bulk sync (UTF-8)
│
├── scripts/
│   └── compare_tables.py       # Intersection-based comparison vs old pipeline output
│
└── tests/
    ├── __init__.py
    ├── test_mapping.py          # 21 tests: field manifest extraction
    ├── test_schema_generator.py # 19 tests: SQL generation from mapping.json
    ├── test_transforms.py       # 36 tests: field transformation functions
    ├── test_loader.py           # 27 tests: bulk load and transaction safety
    └── test_server.py           # 31 tests: Flask API endpoints (injectable FakeQueue)
```

---

## What Goes Where

### `redcap_importer/`
Everything to do with fetching data from REDCap. `mapping.py` derives the field
list used by the downloader. Neither file is called at runtime except by the
pipeline entry point.

### `schema/`
One-time generation tool only. Run `python -m schema.generator` to regenerate
`migrations/001_initial_schema.sql` if `mapping.json` ever changes. Do not import
`schema/` from the runtime pipeline.

### `migrations/`
Static SQL files committed to git. Applied by `loader.py` at startup when
`CREATE_TABLES=1`. Add new numbered files for schema changes (e.g.,
`002_add_constraints.sql`).

### `transformer/`
Explicit Python mapping from REDCap record dicts to per-table row dicts. One
function per table (or group of related tables). No dynamic expression parsing —
just clear, readable Python.

### `loader/`
All database interaction: migration runner, COPY-based bulk load, transaction
management. Uses `psycopg2.sql.Identifier()` for all table/column names.

---

## Deleted from Old Structure

```
services/pipeline/
├── map-pipeline/               ← DELETE (Scala/Spark ETL)
├── map-pipeline-schema/        ← DELETE (Haskell schema generator)
├── reload4j-1.2.26.jar        ← DELETE (Spark log4j)
├── reload.py                   ← REPLACE with transformer/ + loader/
└── utils.py                    ← REPLACE with redcap_importer/
```
