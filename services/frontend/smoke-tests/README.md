# Frontend smoke tests

Playwright browser tests that drive the real UI against real backend data to
catch regressions the unit tests can't — blank pages, broken downloads, crashes
on interaction. They were written to lock in the fixes for two production bugs:

- **Blank Site Metrics CSV** — the download produced headers but no rows.
- **White screen on "add columns"** — toggling a column in a study table
  unmounted the whole app.

## Prerequisites

You need the dev server running with `/api` (and `/data`) proxied to real
services. From the repo root, using the hot-reload dev workflow:

```bash
# Terminal 1 — port-forward the API and (optionally) pipeline2
export KUBECONFIG=/path/to/kubeconfig
kubectl port-forward svc/ctmd-api -n ctmd 3030:3030
# (only needed for pages that hit /data)
# kubectl port-forward svc/ctmd-pipeline2 -n ctmd 5000:5000

# Terminal 2 — dev server (proxies /api -> :3030, /data -> :5000)
make dev-ui
```

The API must be reachable and authenticated. For local runs, start the API with
`AUTH_ENV=development` so `/auth_status` returns a demo user and pages load
without REDCap SSO.

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

Append an entry to the array in `tests.js`:

```js
{
  name: 'My page: does the thing',
  async run(page) {
    await page.goto(`${BASE_URL}/my-page`, { waitUntil: 'networkidle' })
    // ... drive the UI ...
    assert(condition, 'message shown on failure')
  },
}
```

Shared helpers live in `lib.js`:

- `fatalState(page)` — detects a blanked page (dev overlay or unmounted root).
- `toggleAllColumns(page)` — opens a material-table columns menu and toggles
  every column, failing if the page crashes.
- `assert(cond, msg)` — throws a readable error.
