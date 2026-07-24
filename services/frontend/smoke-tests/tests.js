/**
 * Smoke test definitions. Each test receives a Playwright `page` plus helpers
 * and throws on failure. Add new tests by appending to the exported array.
 */
const { BASE_URL, toggleAllColumns, assert } = require('./lib')

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
]

module.exports = { tests }
