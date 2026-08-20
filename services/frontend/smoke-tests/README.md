# Frontend smoke tests

Playwright browser tests that drive the real UI against real backend data to
catch regressions the unit tests can't — blank pages, broken downloads, crashes
on interaction, and dead endpoints. The suite is broad by design: it exercises
**every API endpoint, every pipeline2 `/data` read, and every frontend route**,
plus targeted regression tests for specific production bugs we fixed.

## What it covers

The `tests` array in `tests.js` is assembled from groups:

1. **API endpoint coverage** — every `GET /api/*` route returns 200 + sane JSON;
   the core datasets (proposals, statuses, tics, organizations, therapeutic
   areas) must be non-empty (an empty result means a broken sync or mapping).
2. **Parameterized endpoints** — the `/proposals/:id` and `/studies/:id` family,
   using a real proposal id discovered from live data.
3. **Non-JSON endpoints** — the `graphics/proposals-by-tic` SVG, `auth_status`,
   and every downloadable CSV template.
4. **pipeline2 `/data` reads** — task queue, backup list, table reads. These
   **skip** (not fail) when pipeline2 isn't port-forwarded.
5. **Upload validation** — each upload endpoint must reject a malformed row with
   `400`. Safe against real data: a `400` means nothing is written.
6. **View render coverage** — every frontend route renders without blanking or
   throwing an uncaught exception.
7. **Regression tests** — the specific bugs we fixed:
   - **Blank Site Metrics CSV** — the download produced headers but no rows.
   - **White screen on "add columns"** — toggling a column in a study table
     unmounted the whole app.
   - **Stuck REDCap sync** — proposal data went stale.
   - **"This Grant Year"** — used the wrong (July fiscal) year boundary.

## Prerequisites

You need the CRA dev server on :3000 proxying `/api` → the API (:3030) and
`/data` → pipeline2 (:5000). Because the auth middleware gates every `/api`
route, run the **API locally in `AUTH_ENV=development`** (which bypasses REDCap
SSO) rather than port-forwarding the production pod — otherwise every request is
a 401. The API and pipeline2 both talk to the real DB (`ctmd-db2`) over a
port-forward.

```bash
# 1. Port-forward the DB (both API and pipeline2 use ctmd-db2)
kubectl port-forward svc/ctmd-db2 -n ctmd 5439:5432

# 2. Port-forward pipeline2 (only needed for the /data tests)
kubectl port-forward svc/ctmd-pipeline2 -n ctmd 5000:5000

# 3. Local redis for API sessions (one-time; reuse the container after)
docker run -d --name ctmd-dev-redis -p 6380:6379 redis:7-alpine

# 4. API locally in dev mode, pointed at the port-forwarded DB
cd services/api
POSTGRES_HOST=localhost POSTGRES_PORT=5439 POSTGRES_DB=postgres POSTGRES_USER=ctmd-user \
POSTGRES_PASSWORD=<db-password> AUTH_ENV=development API_PORT=3030 \
REDIS_HOST=localhost REDIS_PORT=6380 REDIS_SESSION_DB=2 API_SESSION_SECRET=devsecret node app

# 5. CRA dev server (proxies /api -> :3030, /data -> :5000)
cd services/frontend && API_PROXY_TARGET=http://localhost:3030 BROWSER=none npm start   # or: make dev-ui
```

The `/data` tests **skip** cleanly if pipeline2 (step 2) isn't running, so you
can run the API/UI-only subset without it.

## Running

```bash
cd services/frontend/smoke-tests
npm install
npm run install-browser   # one-time: downloads Chromium
npm test                  # runs all tests headless

SMOKE_HEADED=1 npm test               # watch the browser
SMOKE_BASE_URL=http://host:3000 npm test
```

Exit code is non-zero if any test fails.

## Adding a test

For broad coverage, add to the **data-driven arrays** near the top of
`tests.js` — one line gets you a generated test:

- a new API endpoint → add its path to `API_GET_ENDPOINTS`
  (`['/api/thing', { nonEmpty: true }]`);
- a new `:id` endpoint → `API_ID_ENDPOINTS`;
- a new frontend route → `VIEW_ROUTES` (`['/thing', 'Thing']`);
- a new upload endpoint → `UPLOAD_ENDPOINTS`.

For anything bespoke (driving the UI, asserting a computed value), append a
`{ name, run }` object to the relevant group array:

```js
{
  name: 'My page: does the thing',
  async run(page, { fatalState, pageErrors }) {
    await page.goto(`${BASE_URL}/my-page`, { waitUntil: 'networkidle' })
    // ... drive the UI ...
    assert(condition, 'message shown on failure')
  },
}
```

Shared helpers live in `lib.js`:

- `okJson(page, path, { nonEmpty })` — GETs a JSON endpoint, asserts 200 + valid
  shape, returns the body.
- `dataRequest(page, method, path, opts)` — requests a pipeline2 `/data`
  endpoint, turning "not port-forwarded" into a **skip** instead of a failure.
- `fatalState(page)` — detects a blanked page (dev overlay or unmounted root).
- `toggleAllColumns(page)` — opens a material-table columns menu and toggles
  every column, failing if the page crashes.
- `assert(cond, msg)` / `skip(msg)` — throw a readable error / mark unrunnable.
