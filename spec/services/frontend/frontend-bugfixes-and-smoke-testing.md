# Frontend Bugfixes & Smoke Testing

> **Status: implemented on branch `ctmd-163` (2026-07-23)** — not yet merged.
>
> - Blank Site Metrics CSV — fixed
> - White screen when adding table columns — fixed (crash prevention + error boundary)
> - CRA dev-proxy prefix stripping — fixed
> - Playwright smoke-test harness added at `services/frontend/smoke-tests/`
>   — expanded 2026-08-20 to comprehensive coverage of every endpoint and route
>   (63 tests, passing). See "Coverage" below.

## Addendum — "Submissions at a Glance" grant year (2026-07-29)

Stakeholders reported the **"This Grant Year"** figure in the *Proposal
Submissions at a Glance* widget (`components/Widgets/Counts.js`) was too low —
it should be **10** but showed **4**.

Root cause: the widget bucketed submissions into a **July 1 – June 30 fiscal
year**, but the CTMD grant year runs **May 1 – April 30**. On 2026-07-29 the
July window counted only July submissions (4) instead of May 1 → now (10).

Fix: compute the window as May 1 (of this year if month ≥ May, else last year)
through April 30, with inclusive bounds. Verified live: the widget now shows 10,
matching a direct DB count of proposals with `dateSubmitted` in
`2026-05-01 .. 2027-04-30`.

Field validation: `dateSubmitted` maps from REDCap intake field `prop_submit`
(instrument `admin_review`) — confirmed correct, since the May 1 count matches
the stakeholders' expected 10 exactly. Only the boundary was wrong.

Guarded by a smoke test that recomputes the grant-year count from
`/api/proposals` and compares it to the rendered widget value.

Separately noted (not fixed here): the widget's **"Total"** shows 587 while the
DB holds ~769 proposals, because `/api/proposals` uses INNER JOINs that drop
proposals lacking a Submitter / ProposalDetails / ProposalFunding /
therapeuticArea row. If REDCap's "proposals at a glance" total is the full
count, our Total will read low for the same reason — worth a follow-up.

## Problem Statement

Two bugs were reported by users and confirmed by developers on the deployed
dashboard (`v3.1.22`, prod namespace `ctmd`):

1. **Site Metrics download returns a blank CSV** — the file has headers but no
   data rows.
2. **Adding columns to a study table blanks the page** — using the columns
   button on an individual study's Sites table produces a white screen, across
   all browsers.

Neither is a data problem: the API and `ctmd-pipeline2` both read `ctmd-db2`,
and `StudySites` holds 905 rows. Both are frontend defects.

## Root Causes

### Bug 1 — Blank Site Metrics CSV

**File:** `services/frontend/src/components/Forms/SiteMetricsDownload.js`

The component fetched sites with **one sequential, awaited request per
proposal** (~575 requests to `/api/studies/:id/sites`) and only called
`setSites()` **after every request resolved**:

```js
const sites = []
for (const proposal of proposals) {
  const response = await axios.get(api.studySitesByProposalId(proposal.proposalID))
  ...
  sites.push(...response.data)
}
setSites(sites)              // reached only if ALL ~575 requests succeed
```

Consequences, both yielding an empty CSV:

- **Slow-fill race:** `sites` stays `[]` for tens of seconds while requests run.
  `react-csv`'s `CSVLink` captures whatever `sites` is at click time, so an early
  click downloads nothing. The component's own on-screen warning ("wait for the
  file to finish downloading…") was a band-aid over this race.
- **All-or-nothing failure:** the whole loop sat in a single `try/catch` that
  only logged. One transient failure among ~575 requests meant `setSites` never
  ran.

Wasteful, too: only ~22 of ~575 proposals actually have sites, so the vast
majority of requests returned `[]`.

### Bug 2 — White screen when adding table columns

**Files:** all `services/frontend/src/components/Tables/*` that use
`material-table` (`SitesTable`, `StudiesTable`, `ProposalsTable`,
`SitesEnrollmentTable`, `LookupTable`).

`material-table@1.69.3` officially supports only React 16/17, but the app runs
**React 18.3.1** (the Dockerfile installs with `--legacy-peer-deps`). Its
`DataManager.setColumns()` builds the "columns needing a width" list with a
filter that **excludes `hidden` columns**, leaving a hidden column's
`tableData.width === undefined`. When the user reveals that column via the
columns button, `MTableHeader.getCellStyle()` calls
`CommonValues.reducePercentsInCalc(undefined, …)`, which does `undefined.match(…)`
and throws:

```
TypeError: Cannot read properties of undefined (reading 'match')
```

There was **no error boundary** anywhere in the app. Under React 18's
`createRoot`, an uncaught render error unmounts the entire root — the whole page
goes blank. This is why the symptom was a total white screen and reproduced
cross-browser.

The individual study Sites table is the worst case: ~33 columns, most
`hidden` + `hiddenByColumnsButton`, so revealing any one crashed reliably.

### Related — CRA dev proxy

**File:** `services/frontend/src/setupProxy.js`

Production nginx uses `location /api/ { proxy_pass http://ctmd-api:3030/; }`,
whose trailing slashes strip the `/api` prefix. The dev proxy did **not**
rewrite the path, so `/api/auth_status` reached the API as `/api/auth_status`
(404) instead of `/auth_status`. Locally this surfaced as an "Access Denied"
screen and made the bugs impossible to reproduce with `make dev-ui`.

## Fixes

### Bug 1

Rewrote the effect in `SiteMetricsDownload.js`:

- One bulk request to `GET /api/studies/studysites` (endpoint already existed as
  `studiesController.getStudySites`).
- Join proposal title/description client-side via a `Map` keyed on proposal id
  (sites use `ProposalID`, store proposals use `proposalID`).
- Filter to sites belonging to a known proposal (drops orphan `StudySites` rows
  with no `ProposalID` that would export as blank-proposal rows) — matches the
  old per-proposal behavior.
- Added a `status` state (`loading` / `ready` / `error`); the Download button is
  disabled until data is ready, and shows the row count or an error message.

### Bug 2

Two independent layers:

1. **Crash prevention** — `ensureColumnWidths(columns)` in
   `services/frontend/src/utils/tables.js` gives every column an explicit
   `width` (default `'auto'`), so `tableData.width` is always a defined string
   and `reducePercentsInCalc` never receives `undefined`. Applied to all five
   material-table tables.
2. **Defense in depth** — `services/frontend/src/components/ErrorBoundary/`
   wraps the routed content in `Dashboard.js`, keyed on `location.pathname` so a
   crash clears on navigation. Any future component crash now degrades to a
   recoverable "Something went wrong displaying this section" card instead of
   blanking the whole app.

### Dev proxy

Added `pathRewrite: { '^/api': '' }` and `{ '^/data': '' }` to
`setupProxy.js` so local dev mirrors nginx.

## Verification

Verified in a real browser (Playwright + Chromium) against the live `ctmd-db2`
data via the local dev stack (see `services/frontend/smoke-tests/README.md`):

- Toggling **all 33 columns** on `/studies/146` — no crash, no page errors, root
  stays mounted.
- Studies list and Proposals list column toggles — no crash.
- Site Metrics download — CSV with **1312 data rows**, each with a populated
  Proposal ID / Name (previously 0 rows).
- Error boundary — with the width fix temporarily disabled, a forced crash
  renders the fallback card and keeps the nav/layout mounted (root not
  unmounted).

## Reusable Local Dev Stack

This is the setup used to reproduce/verify the bugs above **and to run the
smoke tests**: the hot-reload CRA dev server proxying to a **real API** and
**real pipeline2**, both backed by the **real `ctmd-db2`** data in the cluster.
It also lets you develop UI changes without rebuilding an image.

> **Why run the API locally instead of port-forwarding the `ctmd-api` pod?**
> The production API has REDCap SSO auth enabled, so every `/api/*` call without
> a session returns 401. Running it locally with `AUTH_ENV=development` bypasses
> the auth middleware, which is what lets the smoke tests (and your browser) hit
> every endpoint. Port-forward the DB and pipeline2 pods; run the API yourself.

Five pieces run concurrently. Each block is copy-pasteable.

**0. Cluster access.** The cluster is `sterling`, in your default kubeconfig as
the `jseals@sterling` context (adjust for your user). You must be on the **RENCI
VPN**; the OIDC token expires and a stale one returns `403 Forbidden` — just
re-run any `kubectl` command to trigger the browser re-login.

```bash
kubectl config use-context jseals@sterling
kubectl get ns ctmd          # smoke test: succeeds → you're authed
```

**1. Port-forward the database** (`ctmd-db2` — the API and pipeline2 both use it
via the `db-dsn-pipeline2` secret). The password lives in that secret; read it
rather than hardcoding:

```bash
kubectl port-forward svc/ctmd-db2 -n ctmd 5439:5432
# In another shell, grab the DB password for step 3:
kubectl get secret db-dsn-pipeline2 -n ctmd -o jsonpath='{.data.dsn}' | base64 -d
```

> **Tunnel gotcha:** `kubectl port-forward` drops intermittently ("lost
> connection to pod"), which will flake a full smoke run. Keep it alive with a
> reconnect loop:
> ```bash
> while true; do kubectl port-forward svc/ctmd-db2 -n ctmd 5439:5432; sleep 1; done
> ```

**2. Port-forward pipeline2** (`ctmd-pipeline2` — required for the `/data` smoke
tests and any Uploads/backup/restore/sync page; the `/data` tests **skip**
cleanly if you omit this):

```bash
kubectl port-forward svc/ctmd-pipeline2 -n ctmd 5000:5000
# (same reconnect-loop tip applies)
```

**3. Local Redis** for the API session store (any throwaway instance):

```bash
docker run -d --name ctmd-dev-redis -p 6380:6379 redis:7-alpine
```

**4. API in dev mode.** `AUTH_ENV=development` bypasses REDCap SSO — the auth
middleware is skipped and `/auth_status` returns a demo user, so pages load
without a real login:

```bash
cd services/api
POSTGRES_HOST=localhost POSTGRES_PORT=5439 POSTGRES_DB=postgres \
POSTGRES_USER=ctmd-user POSTGRES_PASSWORD=<db-password-from-step-1> \
AUTH_ENV=development API_PORT=3030 \
REDIS_HOST=localhost REDIS_PORT=6380 REDIS_SESSION_DB=2 API_SESSION_SECRET=devsecret \
node app
```

Sanity check: `curl localhost:3030/auth_status` returns the demo user, and
`curl localhost:3030/proposals | head -c 100` returns rows.

**5. CRA dev server** (proxies `/api` → :3030, `/data` → :5000 per
`setupProxy.js`; needs the prefix-stripping fix above):

```bash
cd services/frontend
API_PROXY_TARGET=http://localhost:3030 BROWSER=none npm start
# or: make dev-ui   (from repo root)
```

Sanity check the whole chain through the proxy before running the suite:

```bash
for e in api/proposals api/statuses api/graphics/proposals-by-tic data/task; do
  printf '%-32s ' "$e"; curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/$e
done   # all should be 200
```

Teardown:

```bash
docker rm -f ctmd-dev-redis
# Ctrl-C the API, dev server, and each kubectl port-forward (loop)
```

## Smoke Testing

`services/frontend/smoke-tests/` is a self-contained Playwright harness that
drives the real UI against real backend data — catching blank pages, broken
downloads, and crash-on-interaction bugs that unit tests miss.

**Prerequisite:** bring up the **Reusable Local Dev Stack** above first — the
suite talks to `http://localhost:3000` and expects `/api` (and, for the `/data`
group, pipeline2) reachable through the proxy. Run the chain sanity-check
(step 5) and confirm all `200`s before `npm test`; otherwise you'll get a wall
of failures that just mean "backend isn't up."

```bash
cd services/frontend/smoke-tests
npm install
npm run install-browser        # one-time: downloads Chromium
npm test                       # headless run of all tests
SMOKE_HEADED=1 npm test        # watch the browser drive
SMOKE_BASE_URL=http://host:3000 npm test
```

Environment knobs:

- `SMOKE_BASE_URL` — target origin (default `http://localhost:3000`); point it
  at a port-forwarded stage/prod to smoke a deploy.
- `SMOKE_PROPOSAL_ID` — preferred proposal id for the `:id` endpoints and report
  views (default `146`); the suite falls back to a real id from live data if it
  isn't present.
- `SMOKE_FRESHNESS_DAYS` — max age of the newest proposal before the freshness
  test fails (default `120`).

The `/data` tests **skip** (not fail) when pipeline2 isn't port-forwarded, so an
API/UI-only run is still meaningful. A non-zero exit means a real failure.

- `lib.js` — helpers: `fatalState` (detects a blanked page via the dev overlay
  or an unmounted `#root`), `toggleAllColumns`, `okJson` (GET a JSON endpoint,
  assert 200 + shape), `dataRequest` (call pipeline2 `/data`, skip if it's not
  port-forwarded), `assert`, `skip`.
- `tests.js` — data-driven: broad coverage comes from arrays
  (`API_GET_ENDPOINTS`, `API_ID_ENDPOINTS`, `VIEW_ROUTES`, `UPLOAD_ENDPOINTS`),
  so adding an endpoint or view is a one-liner. Bespoke checks are `{ name, run }`
  objects appended to a group.
- `run.js` — runner, prints pass/fail/skip, exits non-zero only on failure;
  passes `pageErrors` (uncaught exceptions) into each test.

### Coverage (comprehensive — 63 tests as of 2026-08-20)

The suite now exercises **every endpoint and every frontend route**, grouped as:

1. **API endpoints** — every `GET /api/*` returns 200 + valid JSON. Core
   datasets (proposals, statuses, tics, therapeutic-areas, resources) must be
   non-empty (an empty result there means a broken sync or field mapping).
2. **Parameterized endpoints** — `/proposals/:id`, `/studies/:id`,
   `/studies/:id/sites`, `/studies/:id/enrollment-data`, using a real proposal
   id discovered from live data.
3. **Non-JSON endpoints** — the `graphics/proposals-by-tic` SVG, `auth_status`
   (dev mode), and all five CSV templates.
4. **pipeline2 `/data` reads** — `task`, `backup`, `table/Sites`. These *skip*
   (not fail) when pipeline2 isn't port-forwarded.
5. **Upload validation** — each upload endpoint (StudySites, Sites,
   EnrollmentInformation) rejects a malformed row with a 400. Safe against real
   data: a 400 writes nothing.
6. **View render** — all 18 routes render without blanking or throwing an
   uncaught JS error.
7. **Regression tests** — the specific bugs fixed here: Site Metrics CSV has
   rows, column toggle doesn't blank, Submissions By Month isn't the empty
   state, proposal data is fresh (`SMOKE_FRESHNESS_DAYS`, default 120), and
   "This Grant Year" uses the May 1–Apr 30 boundary.

**Findings surfaced by the first comprehensive run (2026-08-20):**
- `/proposals/approved-services` and `/proposals/submitted-services` threw a 500
  (`meeting_date.toDateString()` on proposals with no meeting date) — fixed with
  a null guard in `controllers/proposals.js`. These routes aren't used by the
  current frontend, so the crash had gone unnoticed.
- `/api/organizations` returns `[]` because the `name` table has no
  `submitterInstitution` mapping (REDCap doesn't code submitter institution as a
  lookup). The "Proposals by Organization" view renders but without named
  groups. Left as an endpoint-health check pending a product decision on whether
  organizations *should* be populated.

### Remaining future work

- **Data-correctness (not just render)** for each grouping view: HEAL-only
  toggle changes counts; per-group totals reconcile with `/api/proposals`.
- **Auth-gated behavior**: unauthenticated users see the login page; PL-admin
  links (Uploads, Data Manager) appear only for admins.
- **CI integration**: run headless against a port-forwarded stage on PRs to
  `main`.

> Tunnel note: `kubectl port-forward` to `ctmd-db2`/`ctmd-pipeline2` drops
> intermittently ("lost connection to pod"). For a stable full run, wrap each in
> a reconnect loop: `while true; do kubectl port-forward …; sleep 1; done`.
