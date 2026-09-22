# Patient Demographics & Site Contribution (CTMD-158 epic)

> **Status (2026-09-21):** read + display **and** ingestion **implemented** on
> branch `ctmd-161-frontend` (stacked on `ctmd-160-api`, PR #421). **Not merged
> to `main`.** Users can now upload per-study demographics via the Uploads page;
> the write path was verified end-to-end against the live `ctmd` pipeline2 (CSV
> upload → DB row → API read-back). What remains is the ship loop: merge →
> release build → deploy the release to `ctmd` (replacing the test images) →
> revert the test-image overrides. See **Remaining work**.

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
| CTMD-191 | **Re-scoped** → per-study NIH-form **data entry** (was: standalone targets) | **built** — CSV upload card (planned + actual). Cross-total (ethnicity=race) validation NOT implemented (optional). |
| CTMD-162 | E2E + deploy | write path E2E-verified on `ctmd`; **merge → release → deploy release → revert test images** still to do |

## Data model — CTMD-159

`services/pipeline2/migrations/004_add_enrollment_demographics.sql`

- Table `EnrollmentDemographics`, keyed by `ProposalID`.
- One row per study. Cells are `BIGINT` counts across the NIH cross:
  **planned/actual × ethnicity/race × sex**. The migration file is the source
  of truth for exact column names.
- **CSV-managed, not REDCap-sourced.** It is in `pipeline2`'s
  `CSV_ONLY_TABLES` set, so the REDCap sync never truncates/loads it. Data
  arrives via the CSV upload path (see Ingestion).

## Ingestion — CTMD-191

Per-study demographics are entered by CSV upload on the **Uploads** page
(*Per-Study Uploads → Upload Patient Demographics*). No REDCap involvement.

- **Template:** `services/api/templates/enrollment-demographics-template.csv`,
  registered as `enrollment-demographics` in
  `services/api/controllers/template-download.js`. Like every CTMD template it
  has **two header rows** — row 1 is human-readable labels (skipped), row 2 is
  the exact DB column names. The `DropZone` sends `has_comments=true`, so
  pipeline2 skips row 1 and COPYs using row 2 as the columns. Row 2 must match
  `EnrollmentDemographics` columns exactly (`ProposalID`, `planned*`, `actual*`).
- **Write endpoint:** the generic pipeline2 table API —
  `POST /table/EnrollmentDemographics/column/ProposalID` (upsert by ProposalID:
  rows for each uploaded ProposalID are replaced). Wired in `Api.js` as
  `uploadStudyDemographics`; the card lives in `views/Uploads.js`.
- **Targets + actuals share this path:** the template carries both `planned*`
  (targets, driving the "Show targets" toggle) and `actual*` cells.
- **Verified (2026-09-21):** uploaded a template CSV to the live `ctmd`
  pipeline2 → row landed in `EnrollmentDemographics` → read back through the API
  unchanged. Smoke test asserts the upload card renders on `/uploads`.
- **Not implemented (optional):** NIH cross-total validation (ethnicity totals
  reconciling with race totals) is not enforced at upload.

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

## Remaining work

The feature is now functionally complete (DB, API, donuts, and CSV ingestion for
both targets and actuals — all verified on `ctmd`). What's left is shipping and
one optional nicety:

1. **Ship it (CTMD-162 — E2E + deploy).** Merge PR #421 + the `ctmd-161-frontend`
   PR → release build → deploy the release to `ctmd`, replacing the test images →
   revert the test-image overrides (commands above). `ctmd` currently runs the
   test images; migration 004 ships in the release pipeline2 image and runs as a
   `CREATE TABLE IF NOT EXISTS` no-op where the table already exists.
2. **(Optional) NIH cross-total validation** on upload — enforce that ethnicity
   totals reconcile with race totals per the NIH form. Not required for use.
