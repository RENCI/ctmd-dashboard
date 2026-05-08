# Clinical Trial Management Dashboard

This application is a component of the [Trial Innovation Network](https://trialinnovationnetwork.org/) which uses TIN REDCap trial data to further the TIN mission "addressing critical roadblocks in clinical research and accelerate the translation of novel interventions into life-saving therapies."

The Clinical Trial Management Dashboard allows participants to upload and customize additional data atop REDCap data, view graphs, create reports and draw critical insight into areas that can be improved across various research processes and ongoing trials.

## Current System Architecture

The system is composed of four core services:

| Service | Technology | Role |
|---------|------------|------|
| `pipeline2` | Python 3.12, Flask, psycopg2, RQ | REDCap ETL sync + CSV upload API |
| `api` | Node.js, pg-promise | Data query API for the frontend |
| `frontend` | React | Dashboard UI |
| `ctmd-db2` | PostgreSQL 17 | Primary database (all data) |
| `ctmd-redis` | Redis | RQ task queue + session store |

### Data Flow

```
PATH A — REDCap Sync (automated, every 24h)
──────────────────────────────────────────────
REDCap API
    │  (147 targeted fields, batched by proposal)
    ▼
pipeline2: redcap_importer/ → transformer/ → loader/
    │  (TRUNCATE + COPY, transaction-wrapped)
    ▼
ctmd-db2 (18 REDCap-sourced tables)

PATH B — CSV Upload API (user-driven)
──────────────────────────────────────────────
Dashboard User (CSV or JSON upload)
    │
    ▼
pipeline2: Flask API  PUT/POST /table/<name>
    │  (psycopg2 COPY, UTF-8)
    ▼
ctmd-db2 (~19 CSV-managed tables)

FRONTEND READ PATH
──────────────────────────────────────────────
React Frontend
    │  REACT_APP_API_ROOT       → http://ctmd-api:3030/
    │  REACT_APP_DATA_API_ROOT  → http://ctmd-pipeline2:5000/
    ▼
ctmd-api (Node.js) ──► ctmd-db2
ctmd-pipeline2 (Flask) ──► ctmd-db2
```

### Decommissioned

The old pipeline (`services/pipeline/`) has been fully decommissioned:

| Component | Status |
|-----------|--------|
| Scala/Spark ETL (`map-pipeline`) | Removed — `pipeline.create: false` |
| Haskell schema generator (`map-pipeline-schema`) | Removed |
| Old PostgreSQL (`ctmd-db`) | Running as fallback only; no services write to it |
| `csvsql` / `csvkit` | Replaced by psycopg2 COPY |
| JVM, SBT, Stack build systems | Eliminated |

## Project Structure

```
services/
├── pipeline2/          # Active pipeline: REDCap ETL + CSV Upload API
│   ├── server.py       # Entry point: Flask + RQ worker + scheduler
│   ├── redcap_importer/# REDCap API client and field manifest
│   ├── transformer/    # REDCap JSON → per-table row dicts
│   ├── loader/         # Migration runner + TRUNCATE+COPY bulk sync
│   ├── migrations/     # Static SQL schema files
│   ├── scripts/        # Ops utilities (compare_tables.py, migrate_csv_tables.py)
│   └── tests/          # 115 tests across all modules
├── api/                # Node.js data query API (connects to ctmd-db2)
└── frontend/           # React dashboard UI
helm-charts/
└── ctmd-dashboard/     # Helm chart for all services
spec/
├── pipeline/           # Pipeline rebuild specification and timeline
└── services/api/       # API migration documentation
```

## Development

For local development, the [Makefile](Makefile) should be the driver for all local infrastructure setup, container builds, and deployments into the local [KiND](https://kind.sigs.k8s.io/) cluster.

#### Environment Assumptions
We assume you already have docker installed 🐳.

#### Initial Setup
Follow the `setup.mac`, `setup.windows`, `setup.linux` targets to install the basic software needed.

#### Kubernetes in Docker ☸️
`make kind-up` will start a local Kubernetes service in Docker called KiND. ⭐️ You must have the docker service running for this to work.

`make kind-down` will delete the kubernetes service.

#### Using Docker
If working on a service, for example the api — you can build the image locally using `make build-api`. Similarly named targets exist for other services.

For `pipeline2`, always build with `--platform linux/amd64` (required for Kubernetes on arm64 Mac dev machines):
```bash
docker buildx build --platform linux/amd64 -t containers.renci.org/ctmd/ctmd-pipeline2:<tag> --push .
```

#### Deploying with Helm
`make helm-up` will deploy the full ctmd-dashboard into the KiND cluster.

`make helm-dev-down` will delete the ctmd-dashboard helm deployment and pvcs (database data), leaving only the KiND cluster up.

`make helm-down` will uninstall the ctmd-dashboard deployment without removing the pvc (database data).

For production/staging deployments:
```bash
export KUBECONFIG=/path/to/your/kubeconfig
helm upgrade ctmd-dashboard helm-charts/ctmd-dashboard -n <namespace> -f .values.yaml
```

#### Expose the Frontend Service
`make port-forward-ui` will expose the frontend to your local development environment on port 3000. `localhost:3000/` will then be accessible from a browser.

### CI/CD

Automatic container builds occur on push to GitHub via GitHub Actions.

- **On merge to `main`:** all services (`api`, `frontend`, `pipeline2`) are built and tagged with the same semver tag.
- **On feature branch push** (matching `services/pipeline2/**`): `pipeline2` is built and tagged as `test_<branch-name>`.

Every build is pushed to both Renci's container registry (`containers.renci.org/ctmd/`) and DockerHub (`rencibuild/` namespace) for disaster recovery.

See `.github/workflows/build-release.yml` and `.github/workflows/build-pipeline2.yml` for details.
