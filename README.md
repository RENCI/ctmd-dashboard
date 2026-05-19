# Clinical Trial Management Dashboard

This application is a component of the [Trial Innovation Network](https://trialinnovationnetwork.org/) which uses TIN REDCap trial data to further the TIN mission "addressing critical roadblocks in clinical research and accelerate the translation of novel interventions into life-saving therapies."

The Clinical Trial Management Dashboard allows participants to upload and customize additional data atop REDCap data, view graphs, create reports and draw critical insight into areas that can be improved across various research processes and ongoing trials.

## Current System Architecture

| Service | Technology | Role |
|---------|------------|------|
| `pipeline2` | Python 3.12, Flask, psycopg2, RQ | REDCap ETL sync + CSV upload API |
| `api` | Node.js, pg-promise | Data query API for the frontend |
| `frontend` | React (CRA) | Dashboard UI |
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
    │  /api/*  → ctmd-api:3030
    │  /data/* → ctmd-pipeline2:5000
    ▼
ctmd-api (Node.js) ──► ctmd-db2
ctmd-pipeline2 (Flask) ──► ctmd-db2
```

### Decommissioned

The old pipeline (`services/pipeline/`) is fully decommissioned:

| Component | Status |
|-----------|--------|
| Scala/Spark ETL (`map-pipeline`) | Removed — `pipeline.create: false` |
| Haskell schema generator (`map-pipeline-schema`) | Removed |
| Old PostgreSQL (`ctmd-db`) | Running as fallback only; no services write to it |
| `csvsql` / `csvkit` | Replaced by psycopg2 COPY |

## Project Structure

```
services/
├── pipeline2/          # Active pipeline: REDCap ETL + CSV Upload API
│   ├── server.py       # Entry point: Flask + RQ worker + scheduler
│   ├── redcap_importer/# REDCap API client and field manifest
│   ├── transformer/    # REDCap JSON → per-table row dicts
│   ├── loader/         # Migration runner + TRUNCATE+COPY bulk sync
│   ├── migrations/     # Static SQL schema files (001–003)
│   ├── scripts/        # Ops utilities (compare_tables.py, migrate_csv_tables.py)
│   └── tests/          # 115 tests across all modules
├── api/                # Node.js data query API (connects to ctmd-db2)
└── frontend/           # React dashboard UI
    └── src/
        └── setupProxy.js  # Dev-server proxy (mirrors nginx rules)
helm-charts/
└── ctmd-dashboard/     # Helm chart for all services
spec/
├── pipeline/           # Pipeline rebuild specification and timeline
└── services/api/       # API migration documentation
```

## Development

For local development, the [Makefile](Makefile) is the driver for all local infrastructure setup, container builds, and deployments into the local [KiND](https://kind.sigs.k8s.io/) cluster.

#### Environment Assumptions
We assume you already have docker installed.

#### Initial Setup
Follow the `setup.mac`, `setup.windows`, `setup.linux` targets to install the basic software needed.

#### Kubernetes in Docker ☸️
`make kind-up` will start a local Kubernetes cluster in Docker. You must have the docker service running for this to work.

`make kind-down` will delete the kubernetes cluster.

#### Building Images
Build a specific service image:
```bash
make build-api
make build-ui
make build-pipeline2
```

For `pipeline2`, images must always be built with `--platform linux/amd64` (required for Kubernetes on arm64 Mac dev machines). The Makefile handles this automatically.

#### Loading Images into KiND
```bash
make kind-load-api
make kind-load-ui
make kind-load-pipeline2
```

#### Deploying with Helm
`make helm-up` deploys the full stack into the KiND cluster using the default `values.yaml`.

`make helm-dev-down` uninstalls the deployment and deletes PVCs (database data).

`make helm-down` uninstalls the deployment without removing PVCs.

#### Expose the Frontend Service (Kubernetes pod)
`make port-forward-ui` exposes the frontend pod to `localhost:3000`.

#### Frontend Hot-Reload Development (recommended for UI changes)

Instead of rebuilding the image on every change, run the CRA dev server locally. Changes are visible in the browser in **under a second** via hot module replacement — no image rebuild, no pod restart.

`src/setupProxy.js` proxies the same paths nginx handles in prod:
- `/api/*` → `http://localhost:3030` (ctmd-api)
- `/data/*` → `http://localhost:5000` (ctmd-pipeline2)

**Option A — forward both services from prod/stage** (`KUBECONFIG` must point to a cluster where `pipeline2` is deployed):
```bash
# Terminal 1
export KUBECONFIG=/path/to/your/kubeconfig
make dev-services          # forwards ctmd-api :3030 + ctmd-pipeline2 :5000

# Terminal 2
make dev-ui
```

**Option B — local KiND + separate pipeline2 forward** (default KiND does not deploy `pipeline2`):
```bash
# Terminal 1 — API from local KiND
make dev-api

# Terminal 2 — pipeline2 from prod or stage (read-only real data)
export KUBECONFIG=/path/to/your/kubeconfig
make dev-pipeline2                      # prod (ctmd namespace)
make dev-pipeline2 NAMESPACE=ctmd-stage # or stage

# Terminal 3
make dev-ui
```

Proxy targets can be overridden via env vars:
```bash
API_PROXY_TARGET=http://localhost:3030 DATA_PROXY_TARGET=http://localhost:5000 make dev-ui
```

> ⚠️ When forwarding prod/stage services, treat all data as **read-only**. CSV uploads and sync triggers will affect the real database.

### CI/CD

Automatic container builds occur on push to GitHub via GitHub Actions.

- **On merge to `main`:** all services (`api`, `frontend`, `pipeline2`) are built and tagged with the same semver tag.
- **On feature branch push** matching `services/pipeline2/**`: `pipeline2` is built and tagged as `test_<branch-name>`.

Every build is pushed to both Renci's container registry (`containers.renci.org/ctmd/`) and DockerHub (`rencibuild/` namespace) for disaster recovery.

See `.github/workflows/build-release.yml` and `.github/workflows/build-pipeline2.yml` for details.
