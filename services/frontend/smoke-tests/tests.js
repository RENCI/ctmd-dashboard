/**
 * Smoke test definitions. Each test receives a Playwright `page` plus helpers
 * ({ fatalState, pageErrors }) and throws on failure. The exported `tests`
 * array is assembled from several groups:
 *
 *   1. API endpoint coverage   — every GET /api route returns 200 + sane JSON
 *   2. Parameterized endpoints — the /proposals/:id and /studies/:id family
 *   3. Non-JSON endpoints      — graphics SVG, CSV templates, auth_status
 *   4. pipeline2 /data reads   — task queue, backups, table reads (skip if down)
 *   5. Upload validation       — malformed uploads are rejected (safe: no write)
 *   6. View render coverage    — every frontend route renders without crashing
 *   7. Regression tests        — the specific production bugs we fixed
 *
 * Groups 1–6 give broad "does every endpoint/view still work" coverage; group 7
 * locks in past fixes. Add a test by appending to the relevant array below.
 */
const { BASE_URL, toggleAllColumns, assert, skip, okJson, dataRequest, fatalState } = require('./lib')

// A stuck REDCap sync silently freezes all proposal data (the ctmd-165 bug).
// If proposals haven't advanced in this many days, either the sync is broken
// or submissions genuinely paused — both warrant a human look. Generous so
// normal operation never flakes; the real incident was ~90 days stale.
const FRESHNESS_DAYS = Number(process.env.SMOKE_FRESHNESS_DAYS || 120)

// A proposal id used for the :id-parameterized endpoints and report views.
// Resolved against live data at runtime (see resolveProposalId); this is only
// the fallback / preferred value. 146 is a study with many sites.
const PREFERRED_PROPOSAL_ID = process.env.SMOKE_PROPOSAL_ID || '146'

// Uncaught page exceptions we treat as noise, not failures. ResizeObserver's
// "loop limit exceeded" is a benign browser warning nivo/material-table trip.
const IGNORED_PAGE_ERRORS = /ResizeObserver loop/i

/** Pick a real proposal id from live data, preferring PREFERRED_PROPOSAL_ID. */
async function resolveProposalId(page) {
  const res = await page.request.get(`${BASE_URL}/api/proposals`)
  if (!res.ok()) return PREFERRED_PROPOSAL_ID
  const list = await res.json().catch(() => null)
  if (!Array.isArray(list) || list.length === 0) return PREFERRED_PROPOSAL_ID
  const ids = list.map((p) => String(p.proposalID ?? p.ProposalID ?? p.id)).filter((v) => v && v !== 'undefined')
  return ids.includes(String(PREFERRED_PROPOSAL_ID)) ? PREFERRED_PROPOSAL_ID : ids[0]
}

// ── 1. API endpoint coverage ────────────────────────────────────────────────
// [path, { nonEmpty }]. nonEmpty flags the core datasets that must always have
// rows — an empty result there means a broken sync or field mapping, not a
// legitimately empty table.
const API_GET_ENDPOINTS = [
  ['/api/proposals', { nonEmpty: true }],
  ['/api/proposals/by-submitted-service', {}],
  ['/api/proposals/by-status', {}],
  ['/api/proposals/by-tic', {}],
  ['/api/proposals/by-organization', {}],
  ['/api/proposals/by-therapeutic-area', {}],
  ['/api/proposals/by-date', {}],
  ['/api/proposals/approved-services', {}],
  ['/api/proposals/submitted-services', {}],
  ['/api/proposals/network', {}],
  ['/api/statuses', { nonEmpty: true }],
  ['/api/resources', { nonEmpty: true }],
  ['/api/resources/requested', {}],
  ['/api/resources/approved', {}],
  ['/api/pis', {}],
  ['/api/tics', { nonEmpty: true }],
  // organizations reads name-table rows for column='submitterInstitution', which
  // REDCap doesn't code as a lookup — so this is legitimately empty today. Kept
  // as an endpoint-health check (200 + array), not a data-completeness assertion.
  ['/api/organizations', {}],
  ['/api/therapeutic-areas', { nonEmpty: true }],
  ['/api/sites', {}],
  ['/api/ctsas', {}],
  ['/api/studies/studysites', {}],
]

const apiEndpointTests = API_GET_ENDPOINTS.map(([path, opts]) => ({
  name: `API: GET ${path}${opts.nonEmpty ? ' returns data' : ' responds'}`,
  async run(page) {
    await okJson(page, path, opts)
  },
}))

// ── 2. Parameterized (:id) endpoints ────────────────────────────────────────
// [pathTemplate, label, { nonEmpty }]. `{id}` is substituted with a real id.
const API_ID_ENDPOINTS = [
  ['/api/proposals/{id}', 'one proposal', { nonEmpty: true }],
  ['/api/studies/{id}', 'study profile', { nonEmpty: true }],
  ['/api/studies/{id}/sites', 'study sites', {}],
  ['/api/studies/{id}/enrollment-data', 'study enrollment', {}],
]

const apiIdEndpointTests = API_ID_ENDPOINTS.map(([tmpl, label, opts]) => ({
  name: `API: GET ${tmpl} (${label})`,
  async run(page) {
    const id = await resolveProposalId(page)
    await okJson(page, tmpl.replace('{id}', id), opts)
  },
}))

// ── 3. Non-JSON endpoints: graphics SVG, CSV templates, auth_status ──────────
const nonJsonTests = [
  {
    name: 'API: GET /api/graphics/proposals-by-tic returns an SVG',
    async run(page) {
      const res = await page.request.get(`${BASE_URL}/api/graphics/proposals-by-tic`)
      assert(res.ok(), `graphics endpoint returned HTTP ${res.status()}`)
      const body = await res.text()
      assert(/<svg[\s>]/i.test(body), 'graphics endpoint did not return SVG markup')
    },
  },
  {
    name: 'API: GET /api/auth_status reports an authenticated user (dev mode)',
    async run(page) {
      const res = await page.request.get(`${BASE_URL}/api/auth_status`)
      assert(res.ok(), `auth_status returned HTTP ${res.status()} — start the API with AUTH_ENV=development`)
      const body = await res.json()
      assert(body && body.authenticated === true, 'auth_status did not report authenticated:true')
    },
  },
  // Every downloadable CSV template must exist (a 404 breaks the Uploads page).
  ...['ctsas', 'enrollment', 'sites', 'study-profile', 'study-sites'].map((name) => ({
    name: `API: GET /api/template/${name} downloads a CSV template`,
    async run(page) {
      const res = await page.request.get(`${BASE_URL}/api/template/${name}`)
      assert(res.ok(), `template ${name} returned HTTP ${res.status()}`)
      const body = await res.text()
      assert(body.split(/\r?\n/)[0].includes(','), `template ${name} does not look like CSV (no header row)`)
    },
  })),
]

// ── 4. pipeline2 /data read-only endpoints (skip gracefully if not running) ──
const dataReadTests = [
  {
    name: 'DATA: GET /data/task returns the queue status',
    async run(page) {
      const res = await dataRequest(page, 'get', '/data/task')
      assert(res.ok(), `/data/task returned HTTP ${res.status()}`)
      const body = await res.json()
      assert(body && typeof body === 'object', '/data/task did not return an object')
    },
  },
  {
    name: 'DATA: GET /data/backup lists backups',
    async run(page) {
      const res = await dataRequest(page, 'get', '/data/backup')
      assert(res.ok(), `/data/backup returned HTTP ${res.status()}`)
      const body = await res.json()
      assert(Array.isArray(body) || (body && typeof body === 'object'), '/data/backup returned unexpected shape')
    },
  },
  {
    name: 'DATA: GET /data/table/Sites reads a table as JSON',
    async run(page) {
      const res = await dataRequest(page, 'get', '/data/table/Sites')
      assert(res.ok(), `/data/table/Sites returned HTTP ${res.status()}`)
      const body = await res.json()
      assert(Array.isArray(body), '/data/table/Sites did not return an array of rows')
    },
  },
]

// ── 5. Upload validation (safe mutations — a rejected upload writes nothing) ─
// Each upload endpoint must reject a malformed row with 400, not accept it with
// 200 and silently drop it (the ctmd-165 failure mode). A 400 means nothing is
// written to the database, so this is safe to run against real data.
const UPLOAD_ENDPOINTS = [
  {
    label: 'StudySites',
    path: '/data/table/StudySites/column/siteId',
    csv: 'siteId,ProposalID,patientsConsentedCount,siteName\n999999,999999,not-a-number,Smoke Test Row\n',
    offendingColumn: 'patientsConsentedCount',
  },
  {
    label: 'Sites',
    path: '/data/table/Sites/column/siteId',
    csv: 'siteId,siteName\nnot-a-number,Smoke Test Site\n',
    offendingColumn: 'siteId',
  },
  {
    label: 'EnrollmentInformation',
    path: '/data/table/EnrollmentInformation/column/ProposalID',
    csv: 'ProposalID,targetEnrollment\n999999,not-a-number\n',
    offendingColumn: 'targetEnrollment',
  },
]

const uploadValidationTests = UPLOAD_ENDPOINTS.map((u) => ({
  name: `DATA: ${u.label} upload rejects malformed data with 400 (writes nothing)`,
  async run(page) {
    const res = await dataRequest(page, 'post', u.path, {
      multipart: {
        data: { name: 'smoke.csv', mimeType: 'text/csv', buffer: Buffer.from(u.csv) },
        'content-type': 'text/csv',
        user: 'smoke@test',
        json: '{}',
        has_comments: 'false',
      },
      timeout: 15000,
    })
    assert(
      res.status() === 400,
      `expected 400 for malformed ${u.label} CSV, got ${res.status()} — bad data may be silently accepted`,
    )
    const errors = await res.json().catch(() => ({}))
    assert(
      JSON.stringify(errors).includes(u.offendingColumn),
      `${u.label} error response did not identify the offending column (${u.offendingColumn})`,
    )
  },
}))

// ── 6. View render coverage — every route renders without crashing ───────────
// [route, label]. Report views that need a real id are handled separately below.
const VIEW_ROUTES = [
  ['/', 'Home'],
  ['/proposals', 'Proposals list'],
  ['/proposals/organization', 'Proposals by organization'],
  ['/proposals/tic', 'Proposals by TIC'],
  ['/proposals/status', 'Proposals by application status'],
  ['/proposals/therapeutic-area', 'Proposals by therapeutic area'],
  ['/proposals/date', 'Proposals by date'],
  ['/proposals/resources-requested', 'Proposals by resources requested'],
  ['/proposals/resources-approved', 'Proposals by resources approved'],
  ['/collaborations', 'Collaborations'],
  ['/studies', 'Studies list'],
  ['/ctsas', 'CTSAs'],
  ['/sites', 'Sites'],
  ['/uploads', 'Uploads'],
  ['/profile', 'Profile'],
  ['/manage', 'Management'],
]

/** Navigate to a route and assert it rendered without blanking or throwing. */
async function assertViewRenders(page, route, label, pageErrors) {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  const f = await fatalState(page)
  assert(!f.devOverlay, `${label} (${route}) shows the dev-server error overlay`)
  assert(!f.blank, `${label} (${route}) rendered blank (React root only ${f.rootLen} bytes)`)
  const real = (pageErrors || []).filter((e) => !IGNORED_PAGE_ERRORS.test(e))
  assert(real.length === 0, `${label} (${route}) threw: ${real.slice(0, 2).join(' | ')}`)
}

const viewRenderTests = VIEW_ROUTES.map(([route, label]) => ({
  name: `View: ${label} renders (${route})`,
  async run(page, { pageErrors }) {
    await assertViewRenders(page, route, label, pageErrors)
  },
}))

const reportViewTests = [
  {
    name: 'View: Proposal report renders (/proposals/:id)',
    async run(page, { pageErrors }) {
      const id = await resolveProposalId(page)
      await assertViewRenders(page, `/proposals/${id}`, 'Proposal report', pageErrors)
    },
  },
  {
    name: 'View: Study report renders (/studies/:id)',
    async run(page, { pageErrors }) {
      const id = await resolveProposalId(page)
      await assertViewRenders(page, `/studies/${id}`, 'Study report', pageErrors)
    },
  },
]

// ── 7. Regression tests — the specific production bugs we fixed ──────────────
const regressionTests = [
  {
    name: 'Studies list: page loads with data',
    async run(page) {
      await page.goto(`${BASE_URL}/studies`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(2500)
      const text = await page.evaluate(() => document.body.innerText || '')
      assert(text.includes('Studies'), 'Studies heading not found')
      const rows = await page.locator('table tbody tr').count()
      assert(rows > 0, 'Studies table rendered no rows')
    },
  },
  {
    name: 'Studies list: adding columns does not blank the page',
    async run(page) {
      await page.goto(`${BASE_URL}/studies`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(2500)
      const r = await toggleAllColumns(page)
      assert(r.found, 'Show Columns button not found')
      assert(r.crashedAt === null, `page crashed after toggling column #${r.crashedAt}`)
    },
  },
  {
    name: 'Study report: adding columns to the Sites table does not blank the page',
    async run(page) {
      // Proposal 146 is a study with many sites; its Sites table exposes ~33
      // columns, most hidden by default — the original crash repro.
      await page.goto(`${BASE_URL}/studies/146`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(4000)
      const r = await toggleAllColumns(page)
      assert(r.found, 'Show Columns button not found on study report')
      assert(r.crashedAt === null, `study report crashed after toggling column #${r.crashedAt}`)
    },
  },
  {
    name: 'Site Metrics download produces a CSV with data rows',
    async run(page) {
      await page.goto(`${BASE_URL}/studies`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(2500)
      await page.locator('button:has-text("Site Metrics")').click()
      await page.waitForSelector('text=/site rows ready to download/', { timeout: 30000 })
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 30000 }),
        page.locator('a:has-text("Download"), button:has-text("Download")').last().click(),
      ])
      const stream = await download.createReadStream()
      let csv = ''
      for await (const chunk of stream) csv += chunk
      const lines = csv.split(/\r?\n/).filter(Boolean)
      assert(lines.length > 1, `CSV had no data rows (only ${lines.length} line(s)) — the blank-CSV bug`)
      assert(/Proposal ID/.test(lines[0]), 'CSV header missing expected columns')
    },
  },
  {
    name: 'Home: Submissions By Month chart renders (not the empty state)',
    async run(page) {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(3000)
      const body = await page.evaluate(() => document.body.innerText || '')
      assert(/Submissions by Month|Proposals by Month/i.test(body), 'Submissions By Month widget not found on Home')
      assert(
        !/No submissions data available/i.test(body),
        'Submissions By Month shows the empty state — no proposal data reached the chart',
      )
    },
  },
  {
    name: 'Proposal data is fresh (sync not stuck)',
    async run(page) {
      const res = await page.request.get(`${BASE_URL}/api/proposals`)
      assert(res.ok(), `/api/proposals returned ${res.status()}`)
      const proposals = await res.json()
      assert(Array.isArray(proposals) && proposals.length > 0, 'no proposals returned')
      const dates = proposals.map((p) => p.dateSubmitted).filter(Boolean).sort()
      const newest = dates[dates.length - 1]
      assert(newest, 'no proposal has a dateSubmitted — check the field mapping')
      const ageDays = (Date.now() - new Date(newest).getTime()) / 86400000
      assert(
        ageDays <= FRESHNESS_DAYS,
        `newest proposal is ${Math.round(ageDays)} days old (> ${FRESHNESS_DAYS}) — REDCap sync may be stuck`,
      )
    },
  },
  {
    name: 'Submissions at a Glance: "This Grant Year" uses the May 1 grant year',
    async run(page) {
      // The grant year runs May 1 – April 30. Independently compute the count
      // from the API and compare to the widget, so a regression back to a
      // July fiscal year (or any wrong boundary) is caught.
      const now = new Date()
      const startYear = now.getMonth() >= 4 ? now.getFullYear() : now.getFullYear() - 1
      const gyStart = `${startYear}-05-01`
      const gyEnd = `${startYear + 1}-04-30`

      const res = await page.request.get(`${BASE_URL}/api/proposals`)
      assert(res.ok(), `/api/proposals returned ${res.status()}`)
      const proposals = await res.json()
      const expected = proposals.filter(
        (p) => p.dateSubmitted && gyStart <= p.dateSubmitted && p.dateSubmitted <= gyEnd,
      ).length

      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(3000)
      const shown = await page.evaluate(() => {
        const label = Array.from(document.querySelectorAll('span')).find(
          (s) => s.textContent.trim() === 'This Grant Year',
        )
        const valueEl = label && label.previousElementSibling
        return valueEl ? valueEl.textContent.trim() : null
      })
      assert(shown !== null, '"This Grant Year" stat not found on Home')
      assert(
        Number(shown) === expected,
        `"This Grant Year" shows ${shown} but the May 1–Apr 30 grant year (${gyStart}..${gyEnd}) has ${expected} — grant-year window is wrong`,
      )
    },
  },
]

const tests = [
  ...apiEndpointTests,
  ...apiIdEndpointTests,
  ...nonJsonTests,
  ...dataReadTests,
  ...uploadValidationTests,
  ...viewRenderTests,
  ...reportViewTests,
  ...regressionTests,
]

module.exports = { tests }
