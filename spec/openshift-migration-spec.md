# OpenShift Migration Specification

## Revision History

| Date | Author | Description |
|------|--------|-------------|
| 2026-06-01 | J. Seals / Claude | Initial spec; deployment stood up on ashe; egress blocker identified |

## 1. Background & Motivation

The CTMD dashboard runs in production on the RENCI **sterling** Kubernetes cluster (namespace `ctmd`). We are mirroring that deployment to **ashe**, RENCI's OpenShift cluster, under the same namespace name (`ctmd`).

**Why ashe / OpenShift:**
- Multi-cluster resilience for the production dashboard
- OpenShift is RENCI's go-forward platform for new workloads
- Future home for `ctmd.renci.unc.edu`

**Cluster facts:**
- Sterling: `~/.kube/sterling`, native k8s, nginx-ingress, namespace `ctmd`
- Ashe: `api.ashe-k8s.renci.unc.edu:6443`, OpenShift, namespace `ctmd` (requester `mhyzon@renci.org`)

## 2. OpenShift Constraints That Drove the Work

OpenShift's restricted-v2 SCC differs from sterling's environment in ways that broke the helm chart as-is:

| Constraint | Value on ashe | Impact |
|---|---|---|
| Project UID range | `1001780000/10000` | Containers run as a UID in `1001780000..1001789999`; never UID 0 or image-baked UIDs (101, 999, etc.) |
| Project fsGroup range | same | Volume group ownership must be set to a value in this range |
| SCC | `restricted-v2` | No privileged containers, no host net/PID, mandatory `runAsNonRoot` enforcement when set |
| Default LimitRange | `default-resource-limit` | Caps unset container `limits.memory` at 256Mi (clamping anything missing) |
| Default StorageClass | `basic` (NetApp Trident CSI) | RWO; same provisioner family as sterling |
| User RBAC scope | namespace-only | `jseals@renci.org` cannot list SCCs, ingressclasses, routes cluster-wide, or EgressFirewall — must trust-by-apply |

## 3. Migration Approach

**Data:** Re-sync from REDCap on ashe rather than `pg_dump`/`pg_restore` from sterling. Avoids encoding fixes and userId hash differences from carrying over; ashe will run on current REDCap data via `pipeline2`.

**Chart strategy:** Extend the existing `helm-charts/ctmd-dashboard` chart with opt-in OpenShift-friendly fields, defaults preserved so sterling continues to render identically. Drive the differences via a committed `values-ashe.yaml` (template) plus a gitignored `.values-ashe.yaml` (secrets).

**Exposure:** Defer Route/Ingress until DNS for `ctmd.renci.unc.edu` is wired up. Pods are reachable inside the cluster via ClusterIP services for verification.

## 4. Chart Changes (Implemented)

All changes are backwards-compatible — sterling deployments render identically with default values.

### 4.1 New values

Added to `helm-charts/ctmd-dashboard/values.yaml`:

```yaml
podSecurityContext: {}            # rendered at .spec.securityContext when non-empty
containerSecurityContext: {}      # rendered on each container when non-empty

route:                            # OpenShift Route (alternative to .ingress)
  create: false
  name: "ctmd-route"
  host: ""
  tls:
    enabled: true
    termination: edge
    insecureEdgeTerminationPolicy: Redirect

postgres:
  image: "postgres"               # overrideable (e.g. bitnami/postgresql)
  dataMountPath: "/var/lib/postgresql/data"
  pgdataSubdir: ""                # set to e.g. "pgdata" to move PGDATA into a subdir

pipeline2:
  postgres:
    image: "postgres"
    dataMountPath: "/var/lib/postgresql/data"
    pgdataSubdir: ""
```

### 4.2 Template edits

| File | Change |
|---|---|
| `templates/api.yaml` | Pod `securityContext`, container `securityContext` on initContainer + main, `resources` from `.Values.api.resources` (was hardcoded `{}`) |
| `templates/frontend.yaml` | Pod + container `securityContext`; `resources` wired from `.Values.frontend.resources`; nginx configmap remounted to `default.conf` (was `nginx.conf`); emptyDir mounts at `/var/cache/nginx` and `/var/run` for non-root nginx |
| `templates/redis.yaml` | Pod + container `securityContext` |
| `templates/pipeline2.yaml` | Pod + container `securityContext` on init + main |
| `templates/db.yaml` | Pod + container `securityContext`; `image` and `dataMountPath` parametrized; optional `PGDATA` env when `pgdataSubdir` set |
| `templates/db-pipeline2.yaml` | Same as `db.yaml` for pipeline2's dedicated postgres |
| `templates/route.yaml` | **NEW** — OpenShift `Route` rendered when `route.create: true` |

### 4.3 New files

- `helm-charts/ctmd-dashboard/values-ashe.yaml` — committed ashe overlay with runbook in header
- `helm-charts/ctmd-dashboard/templates/route.yaml`
- `.gitignore` — added `.values-ashe.yaml` (secrets overlay)

## 5. Current Deployed State (ashe / ctmd)

Helm release `ctmd-dashboard`, revision 4. All five pods Running:

```
ctmd-api         1/1   Running   v3.1.14
ctmd-db2         1/1   Running   postgres:17-alpine (PGDATA=/var/lib/postgresql/data/pgdata)
ctmd-frontend    1/1   Running   v3.1.14
ctmd-pipeline2   1/1   Running   v0.1.11  (migrations 001, 002 applied; scheduler + RQ worker live)
ctmd-redis       1/1   Running   redis:7-alpine
```

PVCs bound on `basic` SC: `ctmd-db2-pvc` (10Gi), `db-backups-pipeline2-pvc` (5Gi).
Secrets created: `api-session-secret` (auto-generated, helm-kept), `db-dsn-pipeline2` (new password, distinct from sterling prod).

## 6. Outstanding Items (in priority order)

### 6.1 [BLOCKER] Egress to redcap.vumc.org

**Status:** open, chasing with ACIS (namespace owner label `k8s.renci.org/owner=ACIS`).

**Symptom:** `POST /sync` returns a job ID; pipeline2 successfully queues the work; `requests.post(...)` to `https://redcap.vumc.org/api/` times out at the TCP level after 60s. DNS resolves (`160.129.8.154`). HTTPS to `github.com` also times out — confirming it is **not** REDCap-specific.

**Diagnosis:** The namespace NetworkPolicy `default-namespace-isolation` covers ingress only ("Not affecting egress traffic"). The block is therefore at a layer the user cannot inspect — most likely a cluster-level `EgressFirewall` (`k8s.ovn.org`, RBAC forbidden) or an external firewall in front of the cluster's egress IPs.

**Resolution path:** Request from ACIS one of:
- `EgressFirewall` allowlist for `redcap.vumc.org` (and any other outbound destinations the app needs)
- `EgressIP` assignment so VUMC can allowlist the source IP at their end
- Cluster-wide `HTTP_PROXY` / `HTTPS_PROXY` settings (would require pod env additions)

**Verification step once unblocked:**

```bash
oc port-forward -n ctmd svc/ctmd-pipeline2 5050:5000 &
curl -X POST http://localhost:5050/sync
oc logs -n ctmd deploy/ctmd-pipeline2 -f
# Expect: RedcapDownloader fetches proposal IDs, batched downloads, then
# loader.sync_redcap_tables TRUNCATE+COPY into ctmd-db2.
```

### 6.2 External exposure (Route + DNS)

**Status:** deferred by design.

**Plan:** Once `ctmd.renci.unc.edu` DNS is provisioned, flip in `values-ashe.yaml`:

```yaml
route:
  create: true
  host: ctmd.renci.unc.edu
api:
  env:
    DASHBOARD_URL: "https://ctmd.renci.unc.edu/"
```

And `helm upgrade`. The Route template (`templates/route.yaml`) is already wired and tested via `helm template`. Cluster wildcard cert covers `*.apps.<cluster>` defaults if a vanity host is not yet available.

### 6.3 REDCap SSO redirect

Currently `api.env.DASHBOARD_URL` in `values-ashe.yaml` points to `https://ctmd.renci.unc.edu/` (the future host). Until that host is reachable, browser-based SSO flows won't complete. For internal/curl-based testing this does not matter.

### 6.4 Data verification post-sync

After the first successful REDCap sync, compare row counts against sterling prod to confirm parity:

```bash
# sterling prod
kubectl port-forward -n ctmd svc/ctmd-db2 5433:5432 &
psql "postgresql://ctmd-user:<sterling-pw>@localhost:5433/postgres" \
  -c "SELECT relname, n_live_tup FROM pg_stat_user_tables ORDER BY 1;" > /tmp/sterling.txt

# ashe
oc port-forward -n ctmd svc/ctmd-db2 5435:5432 &
psql "postgresql://ctmd-user:<ashe-pw>@localhost:5435/postgres" \
  -c "SELECT relname, n_live_tup FROM pg_stat_user_tables ORDER BY 1;" > /tmp/ashe.txt

diff /tmp/sterling.txt /tmp/ashe.txt
```

Expected: identical row counts for all 17 tables (no encoding or userId differences since both are now running pipeline2).

### 6.5 Resource limit tuning under LimitRange

The ashe namespace `LimitRange` defaults caps `memory` at 256Mi. The chart now explicitly sets `resources` on api + frontend (was hardcoded `{}` previously — a real bug that values silently never reached the cluster). For sterling this just means the previously-ignored values from `values.yaml` and `.values.yaml` now actually apply; verify nothing regresses on sterling before merging the change.

## 7. Deploy Runbook

```bash
# 1. Switch context
oc login --server=https://api.ashe-k8s.renci.unc.edu:6443
oc project ctmd

# 2. Create local secret overlay (gitignored)
cat > .values-ashe.yaml <<'EOF'
pipeline2:
  postgres:
    secrets:
      password: "<strong-password>"
  env:
    REDCAP_APPLICATION_TOKEN: "<token-from-sterling>"
EOF

# 3. Render to inspect, then apply
helm template ctmd-dashboard helm-charts/ctmd-dashboard \
  -f helm-charts/ctmd-dashboard/values-ashe.yaml \
  -f .values-ashe.yaml | less

helm upgrade --install ctmd-dashboard helm-charts/ctmd-dashboard \
  -n ctmd \
  -f helm-charts/ctmd-dashboard/values-ashe.yaml \
  -f .values-ashe.yaml

# 4. Watch rollouts
oc rollout status deploy/ctmd-db2 -n ctmd
oc rollout status deploy/ctmd-pipeline2 -n ctmd
oc rollout status deploy/ctmd-api -n ctmd
oc rollout status deploy/ctmd-frontend -n ctmd

# 5. Once 6.1 is unblocked: trigger the initial REDCap sync
oc port-forward -n ctmd svc/ctmd-pipeline2 5050:5000 &
curl -X POST http://localhost:5050/sync
```

## 8. Lessons / Gotchas

These are the specific failures hit during the initial stand-up and the fixes applied — leave them in the spec so the next OpenShift deploy doesn't rediscover them.

1. **`bitnami/postgresql:17` is gone.** Bitnami's August-2025 image policy change retired major-only tags for the free image namespace. Use official `postgres:N-alpine` instead; on OpenShift it works fine with `fsGroup` + `PGDATA` subdir.

2. **Postgres `initdb` fails on the mount root.** OpenShift's `fsGroup` makes the mount root `root:fsGroup`, and `initdb` tries to `chmod 0700` the root. Workaround: set `PGDATA` to a subdir (`/var/lib/postgresql/data/pgdata`) so postgres creates a dir it owns.

3. **nginx default config wins port 80.** Mounting `nginx.conf` *next to* the image's `default.conf` loads both server blocks and nginx tries to bind both 80 and the custom port. Mount as `default.conf` (subPath unchanged) to overwrite.

4. **nginx needs writable cache + run.** Non-root nginx must be able to mkdir under `/var/cache/nginx` and write `/var/run/nginx.pid`. Both are baked image dirs owned by uid 101; add `emptyDir` mounts.

5. **`resources: {}` hides values silently.** `api.yaml` and `frontend.yaml` previously did not reference `.Values.*.resources`. Combined with the project LimitRange's 256Mi default, this caused frontend OOMs on first start. Now wired correctly.

6. **`pipeline2.recurringBackup.persistence.existingClaim` must be set explicitly.** The chart uses the same value for both the PVC name it creates AND the pod's `claimName`; leaving it blank produces mismatched names (`ctmd-pipeline2-backups-pvc` vs. `db-backups-pvc`). Sterling sets `db-backups-pipeline2-pvc` — match that.

7. **`postgres.secrets.create` is independent of `postgres.create`.** With `postgres.create: false` the chart still renders an orphan `db-dsn` secret unless `postgres.secrets.create: false` is also set. Cosmetic, but worth knowing.

## 9. References

- Helm chart: `helm-charts/ctmd-dashboard/`
- Ashe values template: `helm-charts/ctmd-dashboard/values-ashe.yaml`
- Ashe secrets (local only): `.values-ashe.yaml` (gitignored)
- Pipeline2 spec: `spec/pipeline/pipeline-rebuild-spec.md`
- Sterling prod kubeconfig: `~/.kube/sterling`
- Ashe kubeconfig: `~/.kube/ashe_config` (or default `oc` context)
