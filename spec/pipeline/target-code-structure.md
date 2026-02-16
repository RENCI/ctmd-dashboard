# Pipeline Rebuild: Target Code Structure

Reference: [pipeline-rebuild-spec.md](./pipeline-rebuild-spec.md)

---

## Target Directory Layout

```
services/pipeline/
├── application.py              # Entry point
├── config.py                   # Environment-based configuration
├── worker.py                   # RQ worker + scheduler + sync orchestration
├── server.py                   # Flask REST API (existing routes preserved)
│
├── schema/
│   ├── __init__.py
│   ├── models.py               # Pydantic models for mapping.json fields
│   ├── generator.py            # SQL generation from models
│   └── migrator.py             # Numbered-file migration runner
│
├── redcap/
│   ├── __init__.py
│   ├── client.py               # REDCap API client (targeted field extraction)
│   └── manifest.py             # Field manifest builder from mapping.json
│
├── etl/
│   ├── __init__.py
│   ├── pipeline.py             # Orchestrates full ETL flow
│   ├── transforms.py           # Field transformation functions
│   ├── nameparser.py           # PI name parser (port from Scala)
│   ├── filters.py              # Data filters (non-repeating, test data, aux, block)
│   ├── unpivot.py              # Checkbox wide-to-long conversion
│   └── auxiliary.py            # name table + reviewer_organization generation
│
├── database/
│   ├── __init__.py
│   ├── connection.py           # psycopg2 connection management
│   ├── loader.py               # Bulk COPY + atomic transactions
│   ├── validation.py           # Pre-load data validation
│   └── backup.py               # pg_dump / psql backup and restore
│
├── migrations/
│   ├── 001_initial_schema.sql  # Generated from mapping.json
│   └── 002_add_constraints.sql # FK + NOT NULL (deferred)
│
├── tests/
│   ├── conftest.py
│   ├── fixtures/
│   │   ├── mapping_sample.json
│   │   ├── synthetic_records.json
│   │   └── data_dictionary.json
│   ├── test_schema.py
│   ├── test_transforms.py
│   ├── test_nameparser.py
│   ├── test_filters.py
│   ├── test_unpivot.py
│   ├── test_auxiliary.py
│   ├── test_redcap_client.py
│   ├── test_loader.py
│   ├── test_validation.py
│   ├── test_api.py
│   ├── test_equivalence.py
│   └── test_integration.py
│
├── Dockerfile                  # Single-stage Python image
├── pyproject.toml              # Dependencies
└── README.md
```

---

## Deleted from Current Structure

```
services/pipeline/
├── map-pipeline/               ← DELETE (Scala/Spark)
├── map-pipeline-schema/        ← DELETE (Haskell)
├── reload4j-1.2.26.jar        ← DELETE (Spark log4j replacement)
├── reload.py                   ← Split into worker.py, database/, schema/
└── utils.py                    ← Replaced by redcap/client.py, config.py
```
