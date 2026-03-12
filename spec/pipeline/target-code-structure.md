# Pipeline Rebuild: Target Code Structure

Reference: [pipeline-rebuild-spec.md](./pipeline-rebuild-spec.md)

---

## Target Directory Layout

```
services/pipeline2/
├── main.py                     # Entry point: orchestrates download → transform → load
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Single-stage Python image (python:3.12-slim)
│
├── redcap_importer/
│   ├── __init__.py
│   ├── mapping.py              # Parse mapping.json → list of 149 REDCap field names
│   └── downloader.py           # REDCap API client: targeted batch fetch
│
├── schema/
│   ├── __init__.py
│   └── generator.py            # One-time tool: mapping.json → CREATE TABLE SQL
│
├── migrations/
│   └── 001_initial_schema.sql  # Committed static SQL (run this, don't regenerate)
│
├── transformer/
│   ├── __init__.py
│   └── transforms.py           # Direct REDCap JSON → per-table row dicts
│
├── loader/
│   ├── __init__.py
│   └── loader.py               # PostgreSQL COPY, transaction-wrapped, UTF-8
│
└── tests/
    ├── __init__.py
    ├── test_mapping.py          # 21 tests: field manifest extraction
    ├── test_schema_generator.py # 19 tests: SQL generation from mapping.json
    ├── test_transforms.py       # Field transformation functions
    └── test_loader.py           # Bulk load and transaction safety
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
