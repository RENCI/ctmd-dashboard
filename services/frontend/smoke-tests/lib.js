/**
 * Shared helpers for the frontend browser smoke tests.
 *
 * These tests drive a real Chromium browser against a running dev server
 * (default http://localhost:3000) that proxies /api and /data to real backend
 * services. See README.md for the full setup.
 */

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:3000'

/**
 * Detects the "page went blank" failure mode: either the CRA dev-server error
 * overlay is present (dev only), or the React root has been unmounted — which
 * is what a blank white screen looks like in production, where there is no
 * overlay and no error boundary above the crash.
 */
async function fatalState(page) {
  const devOverlay = (await page.locator('iframe#webpack-dev-server-client-overlay').count()) > 0
  const rootLen = await page.evaluate(() => document.getElementById('root')?.innerHTML.length || 0)
  return { devOverlay, rootLen, blank: rootLen < 500 }
}

/**
 * Opens a material-table "Show Columns" dropdown and toggles every column,
 * checking after each toggle that the page did not crash. Revealing a
 * previously-hidden column is the action that used to unmount the whole app.
 * Returns { found, toggled, crashedAt }.
 */
async function toggleAllColumns(page) {
  const btn = page.locator('button[title="Show Columns"]').first()
  if ((await btn.count()) === 0) return { found: false, toggled: 0, crashedAt: null }
  await btn.click()
  await page.waitForTimeout(700)
  const boxes = page.locator('.MuiPopover-root input[type="checkbox"]')
  const n = await boxes.count()
  for (let i = 0; i < n; i++) {
    await boxes.nth(i).click({ force: true }).catch(() => {})
    await page.waitForTimeout(120)
    const f = await fatalState(page)
    if (f.devOverlay || f.blank) return { found: true, toggled: i + 1, crashedAt: i, ...f }
  }
  return { found: true, toggled: n, crashedAt: null, ...(await fatalState(page)) }
}

/** Simple assertion that throws a readable error on failure. */
function assert(condition, message) {
  if (!condition) throw new Error(message)
}

/** Signal that a test can't run (e.g. a backend isn't reachable). */
function skip(message) {
  const err = new Error(message)
  err.skip = true
  throw err
}

/**
 * GETs a JSON endpoint through the dev-server proxy and asserts a healthy
 * response. Returns the parsed body so callers can make further assertions.
 *   opts.nonEmpty  — require a non-empty array/object (catches a broken sync
 *                    or field mapping that silently returns []).
 *   opts.object    — require an object/array payload but allow it to be empty
 *                    (e.g. one proposal's enrollment data).
 */
async function okJson(page, path, opts = {}) {
  const res = await page.request.get(`${BASE_URL}${path}`)
  assert(res.ok(), `${path} returned HTTP ${res.status()}`)
  let body
  try {
    body = await res.json()
  } catch (e) {
    throw new Error(`${path} did not return valid JSON`)
  }
  assert(
    Array.isArray(body) || (body !== null && typeof body === 'object'),
    `${path} returned neither an array nor an object`,
  )
  if (opts.nonEmpty) {
    const len = Array.isArray(body) ? body.length : Object.keys(body).length
    assert(len > 0, `${path} returned empty — expected data (broken sync or field mapping?)`)
  }
  return body
}

/**
 * Runs a request against the pipeline2 /data service, converting the common
 * "not port-forwarded" failures (connection refused, or a 502/503/504 from the
 * dev-server proxy) into a skip rather than a hard failure — /data is optional
 * for most local runs. Returns the response for further assertions.
 */
async function dataRequest(page, method, path, opts) {
  let res
  try {
    res = await page.request[method](`${BASE_URL}${path}`, opts)
  } catch (e) {
    skip(`pipeline2 /data not reachable (${(e.message || '').split('\n')[0]}) — port-forward ctmd-pipeline2 to run this`)
  }
  const s = res.status()
  if (s === 502 || s === 503 || s === 504) {
    skip(`pipeline2 /data not reachable (proxy returned ${s}) — port-forward ctmd-pipeline2 to run this`)
  }
  return res
}

module.exports = { BASE_URL, fatalState, toggleAllColumns, assert, skip, okJson, dataRequest }
