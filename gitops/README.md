# CTMD Dashboard — Continuous Delivery (ArgoCD)

GitOps CD for the `ctmd-dashboard` Helm chart. **`main` is the source of truth**: a version
reaching a cluster is an auditable git commit, and ArgoCD reconciles the rest.

## Flow

```
PR → merge to main
  └─ Build-Push-Release: semver + build/push api,frontend,pipeline2 :vX.Y.Z + tag + GH release
       └─ writes vX.Y.Z into helm-charts/ctmd-dashboard/env/staging-images.yaml, commits to main
            └─ ArgoCD `ctmd-staging` (auto-sync) rolls ctmd-stage to vX.Y.Z
                 └─ Staging Verify: unit suites + Playwright smoke vs staging URL (informational)

Human → Actions → "Deploy to Prod" (choose version; default = latest release)
  └─ writes the version into env/prod-images.yaml, commits to main
       └─ ArgoCD `ctmd-prod` (auto-sync, selfHeal OFF) rolls ctmd to that version
```

- **Staging runs in dev mode** (`values-staging.yaml` → `softwareContext: development` →
  `AUTH_ENV=development`): the API skips the TIN/REDCap SSO auth middleware and `/auth_status`
  returns a canned demo user. No TIN hook is required; pipeline2 still syncs REDCap.
- **Prod stays human-gated**: nothing auto-promotes to prod. `ctmd-prod` has `selfHeal: false`
  and `prune: false`, so manual `oc`/helm hotfixes are **reported** as drift, not reverted —
  the existing manual path can coexist during cutover.
- **No secrets in git.** All creds come from pre-provisioned Secrets referenced via
  `existingSecret`. `helm template … | grep -i password` is empty for both overlays.

## Files

| Path | Purpose |
|------|---------|
| `gitops/apps/ctmd-staging.yaml` | ArgoCD Application → `ctmd-stage` (auto-sync) |
| `gitops/apps/ctmd-prod.yaml` | ArgoCD Application → `ctmd` (auto-sync, selfHeal off) |
| `helm-charts/ctmd-dashboard/values-staging.yaml` | staging overlay (dev mode, ASHE Route) |
| `helm-charts/ctmd-dashboard/values-prod.yaml` | prod overlay (captured from live release) |
| `helm-charts/ctmd-dashboard/env/staging-images.yaml` | staging image tags (CI-written) |
| `helm-charts/ctmd-dashboard/env/prod-images.yaml` | prod image tags (dispatch-written) |
| `.github/workflows/build-release.yml` | build + release + **staging write-back** |
| `.github/workflows/staging-verify.yml` | informational post-deploy tests |
| `.github/workflows/deploy-prod.yml` | manual `workflow_dispatch` prod promotion |

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

## Open admin item

`oc auth can-i create applications.argoproj.io -n ctmd` is **yes**, but that alone does not prove
the ArgoCD instance *reconciles* apps in these namespaces. Confirm `sourceNamespaces` + AppProject
before relying on auto-sync.
