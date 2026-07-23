#!/usr/bin/env node
/**
 * Runs every smoke test in tests.js against a running dev server and prints a
 * pass/fail summary. Exits non-zero if any test fails (CI-friendly).
 *
 * Usage:
 *   npm test                        # headless, http://localhost:3000
 *   SMOKE_HEADED=1 npm test         # watch it drive the browser
 *   SMOKE_BASE_URL=http://... npm test
 */
const { chromium } = require('playwright')
const { BASE_URL, fatalState } = require('./lib')
const { tests } = require('./tests')

async function main() {
  const browser = await chromium.launch({ headless: !process.env.SMOKE_HEADED })
  const results = []

  for (const test of tests) {
    const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 1400, height: 900 } })
    const page = await ctx.newPage()
    const pageErrors = []
    page.on('pageerror', (e) => pageErrors.push((e.message || '').split('\n')[0]))
    const started = Date.now()
    try {
      await test.run(page, { fatalState })
      results.push({ name: test.name, ok: true, ms: Date.now() - started })
      console.log(`  PASS  ${test.name}`)
    } catch (err) {
      results.push({ name: test.name, ok: false, ms: Date.now() - started, error: err.message, pageErrors })
      console.log(`  FAIL  ${test.name}`)
      console.log(`        ${err.message}`)
      if (pageErrors.length) console.log(`        page errors: ${pageErrors.slice(0, 3).join(' | ')}`)
    }
    await ctx.close()
  }

  await browser.close()

  const passed = results.filter((r) => r.ok).length
  console.log(`\n${passed}/${results.length} passed  (target: ${BASE_URL})`)
  if (passed !== results.length) process.exit(1)
}

main().catch((e) => {
  console.error('Smoke runner crashed:', e)
  process.exit(1)
})
