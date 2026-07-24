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

module.exports = { BASE_URL, fatalState, toggleAllColumns, assert }
