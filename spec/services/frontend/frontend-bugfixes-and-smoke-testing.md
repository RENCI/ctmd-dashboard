# Frontend Bugfixes & Smoke Testing

> **Status: implemented on branch `ctmd-163` (2026-07-23)** — not yet merged.
>
> - Blank Site Metrics CSV — fixed
> - White screen when adding table columns — fixed (crash prevention + error boundary)
> - CRA dev-proxy prefix stripping — fixed
> - Playwright smoke-test harness added at `services/frontend/smoke-tests/` (4 tests, passing)

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

This is the setup used to reproduce and verify the bugs above: the hot-reload
CRA dev server proxying to a **real API** backed by the **real `ctmd-db2`**
data in the cluster. It also lets you develop UI changes without rebuilding an
image, and is the environment the smoke tests run against.

Four pieces run concurrently. Each block is copy-pasteable.

**1. Port-forward the database** (`ctmd-db2` — the API and pipeline2 both use it
via the `db-dsn-pipeline2` secret):

```bash
export KUBECONFIG=/Users/jseals/.kube/sterling
kubectl port-forward svc/ctmd-db2 -n ctmd 5439:5432
```

**2. Local Redis** for the API session store (any throwaway instance):

```bash
docker run -d --name ctmd-dev-redis -p 6380:6379 redis:7-alpine
```

**3. API in dev mode.** `AUTH_ENV=development` bypasses REDCap SSO — the auth
middleware is skipped and `/auth_status` returns a demo user, so pages load
without a real login:

```bash
cd services/api
POSTGRES_HOST=localhost POSTGRES_PORT=5439 POSTGRES_DB=postgres \
POSTGRES_USER=ctmd-user POSTGRES_PASSWORD=<db-password> \
AUTH_ENV=development API_PORT=3030 \
REDIS_HOST=localhost REDIS_PORT=6380 REDIS_SESSION_DB=2 API_SESSION_SECRET=devsecret \
node app
```

Sanity check: `curl localhost:3030/auth_status` returns the demo user, and
`curl localhost:3030/studies/studysites | head` returns rows.

**4. CRA dev server** (proxies `/api` → :3030, `/data` → :5000 per
`setupProxy.js`; needs the prefix-stripping fix above):

```bash
cd services/frontend
API_PROXY_TARGET=http://localhost:3030 BROWSER=none npm start
# or: make dev-ui   (from repo root)
```

Only port-forward `ctmd-pipeline2` → :5000 as well if you're exercising pages
that call `/data` (backup/restore/sync). The pages in these bugs use only
`/api`.

Teardown:

```bash
docker rm -f ctmd-dev-redis
# Ctrl-C the API, dev server, and kubectl port-forward
```

## Smoke Testing

`services/frontend/smoke-tests/` is a self-contained Playwright harness that
drives the real UI against real backend data — catching blank pages, broken
downloads, and crash-on-interaction bugs that unit tests miss. It targets the
Local Dev Stack above (`http://localhost:3000` by default).

```bash
cd services/frontend/smoke-tests
npm install
npm run install-browser        # one-time: downloads Chromium
npm test                       # headless run of all tests
SMOKE_HEADED=1 npm test        # watch the browser drive
SMOKE_BASE_URL=http://host:3000 npm test
```

- `lib.js` — helpers: `fatalState` (detects a blanked page via the dev overlay
  or an unmounted `#root`), `toggleAllColumns`, `assert`, `skip` (mark a test
  skipped when a backend isn't reachable).
- `tests.js` — one entry per test; add a test by appending to the array.
- `run.js` — runner, prints pass/fail/skip, exits non-zero only on failure.

Current coverage:
- Studies list loads with data; column toggle on the Studies list and the study
  report Sites table doesn't blank the page; Site Metrics CSV has data rows
  (ctmd-163).
- Home "Submissions By Month" renders (not the empty state); proposal data is
  fresh — newest `dateSubmitted` within `SMOKE_FRESHNESS_DAYS` (default 120),
  catching a stuck REDCap sync; StudySites upload rejects malformed CSV with a
  400 instead of silently accepting it (ctmd-165).

### Planned expansion

The goal is broad frontend regression coverage so UI bugs surface before
release. Candidate additions:

- **Every list view renders with data**: Proposals, Studies, Sites, CTSAs,
  Collaborations, Home dashboard charts.
- **Every material-table**: open the columns menu and toggle all columns
  without crashing; verify export/CSV buttons produce non-empty files.
- **Study report page** (`/studies/:id`): profile, milestones, combined metrics,
  enrollment visualization all render for a study with data and one without.
- **All downloads**: study reports CSV, site metrics CSV, template downloads —
  assert non-empty and correct headers.
- **Filters**: HEAL-only toggle changes result counts; search/filter inputs on
  tables.
- **Auth-gated routes**: unauthenticated users see the login page; PL-admin-only
  links (Uploads, Data Manager) appear only for admins.
- **No console/page errors** on any route (fail the test on uncaught errors).
- **CI integration**: run headless against an ephemeral deploy or a
  port-forwarded stage on PRs to `main`.
