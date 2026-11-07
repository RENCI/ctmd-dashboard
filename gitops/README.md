# CTMD Dashboard — Continuous Delivery (ArgoCD)

GitOps CD for the `ctmd-dashboard` Helm chart. **`main` is the source of truth**: a version
reaching a cluster is an auditable git commit, and ArgoCD reconciles the rest.

## Flow

Build once, promote the same artifact. A merge delivers to staging automatically; cutting
a release is one **button** (`workflow_dispatch`) that also ships it to prod.

```
PR → merge to main
  └─ Build-Staging: build/push api,frontend,pipeline2,smoke :main-<shortsha>   (no release minted)
       └─ writes main-<shortsha> into helm-charts/ctmd-dashboard/env/staging-images.yaml, commits to main
            └─ ArgoCD `ctmd-staging` (auto-sync) rolls ctmd-stage to main-<shortsha>
                 ├─ ArgoCD PostSync hook: Playwright smoke runs IN-CLUSTER vs the frontend;
                 │    pass/fail + logs show on the ctmd-staging app in the ArgoCD UI
                 └─ Staging Verify (GitHub): unit suites (informational; the live-URL smoke is
                      disabled on cloud runners — the UNC-internal route isn't reachable there)

Human → Actions → "Release"  (button: bump patch/minor/major or type a version; default = promote main tip)
  └─ re-tags the already-built main-<shortsha> images → vX.Y.Z in both registries (NO rebuild)
       └─ creates git tag vX.Y.Z + GitHub release
            └─ writes vX.Y.Z into env/prod-images.yaml, commits to main
                 └─ ArgoCD `ctmd-prod` (auto-sync, selfHeal OFF) rolls ctmd to vX.Y.Z

Human → Actions → "Deploy to Prod"  (button: choose version; default = latest release)
  └─ ROLLBACK / REDEPLOY an already-cut release — writes that version into env/prod-images.yaml
       └─ ArgoCD `ctmd-prod` rolls ctmd to it (does not cut a new release)
```

The release re-tag is registry-side (`docker buildx imagetools create`), so the exact bits
staging ran are what reach prod — no rebuild between environments. Cutting a release is the
decision to ship: one click re-tags, releases, and rolls prod. The separate "Deploy to Prod"
button exists only to roll back to or redeploy a different existing version.

- **Staging runs in dev mode** (`values-staging.yaml` → `softwareContext: development` →
  `AUTH_ENV=development`): the API skips the TIN/REDCap SSO auth middleware and `/auth_status`
  returns a canned demo user. No TIN hook is required; pipeline2 still syncs REDCap.
- **Prod stays human-gated**: nothing auto-promotes to prod. `ctmd-prod` has `selfHeal: false`
  and `prune: false`, so manual `oc`/helm hotfixes are **reported** as drift, not reverted —
  the existing manual path can coexist during cutover.
- **No secrets in git.** All creds come from pre-provisioned Secrets referenced via
  `existingSecret`. `helm template … | grep -i password` is empty for both overlays.
- **Post-deploy smoke (staging only).** `templates/smoke-postsync.yaml` is an ArgoCD
  **PostSync hook** Job (gated on `smoke.enabled`, true only in `values-staging.yaml`). After
  each staging sync it runs the Playwright suite in-cluster against `http://ctmd-frontend:3000`
  (which proxies `/api` + `/data`, so one URL covers the stack). The Job shows on the
  `ctmd-staging` app in the ArgoCD UI — its logs are the pass/fail, and a failure marks the
  staging sync failed so you can **check it before promoting**. It never runs in prod and
  never touches prod; promotion stays the GitHub Release button. The Release / Deploy-to-Prod
  run summaries link straight to the ArgoCD UI as a reminder to check smoke first.

## Files

| Path | Purpose |
|------|---------|
| `gitops/apps/ctmd-staging.yaml` | ArgoCD Application → `ctmd-stage` (auto-sync) |
| `gitops/apps/ctmd-prod.yaml` | ArgoCD Application → `ctmd` (auto-sync, selfHeal off) |
| `gitops/bootstrap/argocd-instance.yaml` | Self-hosted ArgoCD instance (OpenShift GitOps operator) for `ctmd-stage` |
| `helm-charts/ctmd-dashboard/values-staging.yaml` | staging overlay (dev mode, ASHE Route) |
| `helm-charts/ctmd-dashboard/values-prod.yaml` | prod overlay (captured from live release) |
| `helm-charts/ctmd-dashboard/env/staging-images.yaml` | staging image tags (CI-written) |
| `helm-charts/ctmd-dashboard/env/prod-images.yaml` | prod image tags (dispatch-written) |
| `.github/workflows/build-staging.yml` | build `:main-<sha>` (incl. `ctmd-smoke`) on merge + **staging write-back** |
| `helm-charts/ctmd-dashboard/templates/smoke-postsync.yaml` | ArgoCD PostSync smoke hook (staging only) |
| `services/frontend/smoke-tests/Dockerfile` | containerised Playwright smoke suite (`ctmd-smoke` image) |
| `.github/workflows/release.yml` | **button**: re-tag `main-<sha>` → `vX.Y.Z` + GH release + **ship to prod** (no rebuild) |
| `.github/workflows/staging-verify.yml` | informational post-deploy tests |
| `.github/workflows/deploy-prod.yml` | **button**: roll back / redeploy a chosen existing release to prod |

## Secret contract (pre-provision per namespace — never in git)

The overlays reference these by name; the chart renders no Secret objects for them.

| Secret | Keys | ctmd (prod) | ctmd-stage |
|--------|------|-------------|------------|
| `api-session-secret` | `session-secret` | **exists** | create |
| `db-dsn-pipeline2` | `POSTGRES_DB`, `POSTGRES_DATABASE_NAME`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `POSTGRES_USER`, `DATABASE_URL` | **exists** | create |
| `pipeline2-redcap` | `REDCAP_APPLICATION_TOKEN` | **create** (token is inline today) | create |

> The staging Postgres initializes its password **from** `db-dsn-pipeline2` (via `envFrom`), so
> `POSTGRES_PASSWORD` and the password inside `DATABASE_URL` must match.

Example (staging — replace placeholders; run once, by an admin or with consent):

```sh
oc create secret generic api-session-secret -n ctmd-stage \
  --from-literal=session-secret="$(openssl rand -hex 32)"

PW='CHOOSE_A_STAGING_DB_PASSWORD'
oc create secret generic db-dsn-pipeline2 -n ctmd-stage \
  --from-literal=POSTGRES_DB=postgres \
  --from-literal=POSTGRES_DATABASE_NAME=postgres \
  --from-literal=POSTGRES_HOST=ctmd-db2 \
  --from-literal=POSTGRES_PORT=5432 \
  --from-literal=POSTGRES_USER=ctmd-user \
  --from-literal=POSTGRES_PASSWORD="$PW" \
  --from-literal=DATABASE_URL="postgresql://ctmd-user:${PW}@ctmd-db2:5432/postgres"

oc create secret generic pipeline2-redcap -n ctmd-stage \
  --from-literal=REDCAP_APPLICATION_TOKEN='STAGING_REDCAP_TOKEN'
```

For **prod**, only `pipeline2-redcap` is new — create it with the existing prod REDCap token,
then the inline `pipeline2.env.REDCAP_APPLICATION_TOKEN` (gitignored `.values.yaml`) is no longer used.

## Bootstrap

1. Confirm the ArgoCD stub (admin): the instance watches `ctmd-stage` and `ctmd`
   (`sourceNamespaces`), and an `AppProject` allows this repo + those destinations.
   If apps are managed from the ArgoCD namespace instead, move `metadata.namespace` in the
   two Application manifests there and set the destination namespace accordingly.
2. Pre-provision the Secrets above.
3. Apply the Applications:
   ```sh
   oc apply -f gitops/apps/ctmd-staging.yaml
   oc apply -f gitops/apps/ctmd-prod.yaml
   ```
4. ArgoCD reconciles: `ctmd-staging` brings up ctmd-stage; `ctmd-prod` adopts the live ctmd
   release (it should show **Synced** with no diff, since `values-prod.yaml` was captured from
   the live release and `env/prod-images.yaml` matches the deployed tag).

## Rollback

- Revert the one-line image-tag commit for that env; ArgoCD rolls back.
- The chart's secret-externalization is additive (gated on new keys); clearing
  `*.existingSecret` / setting `secrets.create: true` restores the inline/local-dev behavior.

## Self-hosting ArgoCD (no cluster-admin) — and the egress blocker

The Red Hat OpenShift GitOps **operator is installed cluster-wide** (v1.22.3), and we can create
`argocds`, `applications`, `appprojects`, `namespacemanagements`, and `rolebindings` in `ctmd` /
`ctmd-stage`. So we can stand up our **own** namespaced ArgoCD instance with no admin help:

```sh
oc apply -f gitops/bootstrap/argocd-instance.yaml      # instance in ctmd-stage, manages its own ns
oc apply -f gitops/apps/ctmd-staging.yaml              # Application in the same ns → reconciled
```

A namespaced instance manages Applications **in its own namespace** by default — no namespace
labeling (which we can't do) and no cluster-admin. Verified 2026-11-04: the operator brings the
instance up **Available** in ctmd-stage. Note the instance's repo-server needs `ephemeral-storage`
raised above the namespace LimitRange default (256Mi) or it is evicted mid-clone — the CR sets 2Gi.

### ⛔ Blocker: cluster egress allowlist (requires admin)

The cluster enforces an **egress allowlist** we can neither see nor edit (`egressfirewalls.k8s.ovn.org`
is admin-only). Verified 2026-11-04 from live pods:

| From | To `redcap.vumc.org:443` | To `github.com:443` |
|------|--------------------------|---------------------|
| prod `ctmd` | ✅ OK | ❌ timeout |
| staging `ctmd-stage` | ❌ timeout | ❌ timeout |

Consequences:
- **ArgoCD repo-server cannot clone from github.com in any namespace** → `ComparisonError … failed
  to list refs … context deadline exceeded`. In-cluster GitOps against this GitHub repo is blocked
  until egress to GitHub is opened (`github.com`, `codeload.github.com`, optionally `api.github.com`).
- **`ctmd-stage` also lacks the `redcap.vumc.org` egress that prod has**, so staging's pipeline2
  REDCap sync would fail until that is opened too.

**Admin ask (the "additional namespace resources"):** add egress-firewall allowances for
`ctmd-stage` → `redcap.vumc.org`, and for the ArgoCD instance's namespace → GitHub. Alternatively,
mirror the repo to an in-cluster/on-campus git the pods can already reach and point `repoURL` there.
Everything else (operator, RBAC, secrets, manifests) is already in place and verified.

## Other prerequisite

If instead you use a central/admin-managed ArgoCD rather than the self-hosted instance above, that
instance must watch `ctmd-stage` + `ctmd` (`sourceNamespaces`) with an AppProject allowing this repo.
