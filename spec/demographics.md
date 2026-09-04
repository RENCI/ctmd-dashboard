# Patient Demographics & Site Contribution (CTMD-158 epic)

> **Status (2026-09-04):** read + display slice **implemented** on branch
> `ctmd-161-frontend` (stacked on `ctmd-160-api`, PR #421). **Not merged to
> `main`.** The data-entry (ingestion) side is **not built** — the feature has
> no way to load demographics yet, so it renders empty everywhere except one
> seeded row. See **Remaining work**.

## Purpose

Show, per study, enrollment broken down the way the **NIH enrollment table**
does — a two-axis grid of **ethnicity/race × sex**, for both **planned
(target)** and **actual** counts — plus a **Site Contribution** view of how much
each participating site contributes toward the study's enrollment goal.

Both live at the bottom of the **Study Report** page (`/studies/:proposalID`).

## Ticket map

| Ticket | Scope | State |
|--------|-------|-------|
| CTMD-158 | Epic | in progress |
| CTMD-159 | DB — `EnrollmentDemographics` table | code complete |
| CTMD-160 | API read path — `GET /studies/:id/demographics` | code complete, PR #421 |
| CTMD-161 | Frontend — Patient Demographics + Site Contribution donuts | code complete |
| CTMD-195 | Timeline Metrics NaN fix (PATMeeting / InitialConsultationDates builders) | folded into `ctmd-161-frontend` |
| CTMD-191 | **Re-scoped** → per-study NIH-form **data entry** + cross-total (ethnicity=race) validation (was: standalone targets) | **not built** (UI target toggle exists, no data source) |
| CTMD-162 | E2E + deploy | **not done** (test images in `ctmd`, not merged) |

## Data model — CTMD-159

`services/pipeline2/migrations/004_add_enrollment_demographics.sql`

- Table `EnrollmentDemographics`, keyed by `ProposalID`.
- One row per study. Cells are `BIGINT` counts across the NIH cross:
  **planned/actual × ethnicity/race × sex**. The migration file is the source
  of truth for exact column names.
- **CSV-managed, not REDCap-sourced.** It is in `pipeline2`'s
  `CSV_ONLY_TABLES` set, so the REDCap sync never truncates/loads it. That also
  means the sync will **never populate it** — data must arrive via an upload
  path that does not yet exist (see Remaining work).

## API — CTMD-160

- Route: `services/api/routes/studies.js`
  → `router.route('/:id(\\d+)/demographics').get(studiesController.getDemographics)`
- Controller: `services/api/controllers/studies.js` — `getDemographics` runs
  `SELECT * FROM "EnrollmentDemographics" WHERE "ProposalID" = <id>` and returns
  the rows array (0 or 1 element).
- Frontend accessor: `services/frontend/src/Api.js` → `studyDemographics(proposalID)`.
- Test: `services/api/controllers/studies.test.js` (Node built-in `node:test`,
  mocks `db.any`; run in CI via `.github/workflows/build-api.yml`).

## Frontend — CTMD-161

- **`views/Studies/Report.js`** — two new `Card`s after *Enrollment
  Information*: **Patient Demographics** and **Site Contribution**. Demographics
  are fetched in their **own `useEffect`, kept out of the `isLoading` gate**, so
  a study with no demographics (or an older API) never blocks the report; on any
  error it falls back to `[]` → empty-state.
- **`components/Visualizations/StudyDemographics.js`** — the Patient
  Demographics card body. NIH two-axis: an **Ethnicity/Race** `ToggleButtonGroup`
  and a **"Show targets"** `Switch` (planned vs. actual). `ETHNICITY` and
  `RACES` constants define the slices; `buildData(row, kind, axis)` shapes them.
- **`components/Visualizations/SiteContribution.js`** — per-site enrollment
  donut + a **"Short of Goal"** slice (gap to the study's enrollment target).
  Renders a **colors-only donut** with a **legend** beside it (swatch + site
  name + count/%). Legend swatch colors mirror nivo's data-order ordinal scale
  (`data[i]` → `chartColors[i]`).
- **`utils/siteContribution.js`** — pure `buildSiteContribution(sites, goal)`
  (no React deps → unit-testable). One slice per site by `patientsEnrolledCount`
  (drops 0-enrolled), plus `Short of Goal = max(0, target − totalEnrolled)`.
  Unit test: `utils/siteContribution.test.js` (6 jest cases).
- **`components/Charts/DemographicsPie.js`** — generic nivo `ResponsivePie`
  donut shared by both cards. See the nivo gotchas below.

### nivo v0.87 gotchas (bit us twice — read before touching the pies)

The installed `@nivo/pie` is **0.87.0**, but the codebase's pie configs use
**pre-0.70 prop names** that this version silently ignores:

1. **Tooltip datum is wrapped.** The `tooltip` callback receives `{ datum }`,
   not the slice directly. Destructuring `({ id, value, color })` off the top
   level yields `undefined` → the percentage renders as **`NaN%`**. Correct:
   `tooltip={ ({ datum: { id, value, color } }) => … }`.
   *(`ProposalsPie.js` has the same latent bug — it just shows a blank number
   instead of NaN. Left as-is; fix if you touch it.)*
2. **Label props were renamed.** `enableRadialLabels` / `enableSlicesLabels`
   (and `radialLabels*` / `slicesLabels*`) are **no-ops** in 0.87. The real
   props are **`enableArcLinkLabels`** (names around the ring) and
   **`enableArcLabels`** (values inside slices). `DemographicsPie` exposes
   `enableRadialLabels` / `enableSlicesLabels` boolean props and maps them to
   the correct nivo props internally; Site Contribution passes both `false` for
   the colors-only look.

## Tests

- Frontend jest: `utils/siteContribution.test.js` (6).
- Smoke (`services/frontend/smoke-tests/tests.js`): "Patient Demographics card
  renders" + "Site Contribution card renders" on `/studies/:id`.
- API: `services/api/controllers/studies.test.js`.
- pipeline2 (CTMD-195): `tests/test_pat_and_consult_dates.py` (10),
  `tests/test_redcap_tables_complete.py` (loader-completeness guard).

## Deployment state — ASHE `ctmd` (PROD)

Currently running **test images** for live review (temporary):

- `ctmd-frontend:test_ctmd-161-frontend` (`imagePullPolicy: Always`)
- `ctmd-api:test_ctmd-160-api` (`imagePullPolicy: Always`)

`EnrollmentDemographics` has **exactly one seeded row — ProposalID 146** — so
that is the only study where the Patient Demographics donut shows data.

**To finish the deployment properly:** merge PR #421 + open/merge the
`ctmd-161-frontend` PR → release build (`build-release.yml`, one semver tag for
all services) → deploy the release to `ctmd` → revert the test-image overrides:

```bash
oc set image deploy/ctmd-frontend ctmd-frontend=containers.renci.org/ctmd/ctmd-frontend:<release> -n ctmd
oc set image deploy/ctmd-api      ctmd-api=containers.renci.org/ctmd/ctmd-api:<release>           -n ctmd
oc patch deploy/ctmd-frontend -n ctmd --type=json -p='[{"op":"replace","path":"/spec/template/spec/containers/0/imagePullPolicy","value":"IfNotPresent"}]'
oc patch deploy/ctmd-api      -n ctmd --type=json -p='[{"op":"replace","path":"/spec/template/spec/containers/0/imagePullPolicy","value":"IfNotPresent"}]'
```

## Remaining work (epic is NOT usable yet)

1. **Ingestion / upload path — the blocker.** Nothing writes
   `EnrollmentDemographics`. The intended entry mechanism is a CSV upload
   ("Expanded Demographics Upload Template" mockup, per-study NIH grid). Until it
   exists, every study shows the empty-state. This is the largest remaining
   chunk.
2. **Targets — CTMD-191.** The "Show targets" toggle is wired in the UI, but
   there is no source or entry for planned/target values (same upload gap).
3. **Ship it (CTMD-162 — E2E + deploy).** Merge → release → deploy → revert the
   test images (above).
