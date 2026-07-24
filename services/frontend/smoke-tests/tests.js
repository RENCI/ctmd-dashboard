/**
 * Smoke test definitions. Each test receives a Playwright `page` plus helpers
 * and throws on failure. Add new tests by appending to the exported array.
 */
const { BASE_URL, toggleAllColumns, assert, skip } = require('./lib')

// A stuck REDCap sync silently freezes all proposal data (the ctmd-165 bug).
// If proposals haven't advanced in this many days, either the sync is broken
// or submissions genuinely paused — both warrant a human look. Generous so
// normal operation never flakes; the real incident was ~90 days stale.
const FRESHNESS_DAYS = Number(process.env.SMOKE_FRESHNESS_DAYS || 120)

const tests = [
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
    name: 'StudySites upload rejects malformed data (does not silently accept)',
    async run(page) {
      // A CSV with a non-numeric integer cell must be rejected with a clear
      // error — not accepted with HTTP 200 and then dropped asynchronously.
      // Safe: a 400 means nothing is written to the database.
      const csv =
        'siteId,ProposalID,patientsConsentedCount,siteName\n' +
        '999999,999999,not-a-number,Smoke Test Row\n'
      let res
      try {
        res = await page.request.post(`${BASE_URL}/data/table/StudySites/column/siteId`, {
          multipart: {
            data: { name: 'smoke.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) },
            'content-type': 'text/csv',
            user: 'smoke@test',
            json: '{}',
            has_comments: 'false',
          },
          timeout: 15000,
        })
      } catch (e) {
        skip(`pipeline2 /data not reachable (${e.message.split('\n')[0]}) — port-forward ctmd-pipeline2 to run this`)
      }
      if (res.status() === 502 || res.status() === 503 || res.status() === 504) {
        skip(`pipeline2 /data not reachable (status ${res.status()})`)
      }
      assert(
        res.status() === 400,
        `expected 400 for malformed CSV, got ${res.status()} — bad data may be silently accepted`,
      )
      const errors = await res.json()
      assert(
        JSON.stringify(errors).includes('patientsConsentedCount'),
        'error response did not identify the offending column',
      )
    },
  },
]

module.exports = { tests }
