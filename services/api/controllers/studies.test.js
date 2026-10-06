// Unit tests for the studies controllers, using Node's built-in test runner
// (no extra deps). The controller captures `const db = require('../config/database')`
// at load — the same cached instance we require here — so overriding `db.any`
// mocks the DB for the controller too. pg-promise is lazy, so requiring the DB
// module opens no connection.
const { test } = require('node:test')
const assert = require('node:assert')

const db = require('../config/database')
const { getDemographics } = require('./studies')

// Let the controller's .then/.catch microtasks run before we assert.
const flush = () => new Promise((resolve) => setImmediate(resolve))

const STEMS = [
  'HispanicFemale', 'HispanicMale', 'NonHispanicFemale', 'NonHispanicMale',
  'AIANFemale', 'AIANMale', 'AsianFemale', 'AsianMale', 'NHPIFemale', 'NHPIMale',
  'BlackFemale', 'BlackMale', 'WhiteFemale', 'WhiteMale',
]
// Build a demographics row like the controller's query returns: planned* from the
// profile, actual* summed from sites. `planned`/`actual` set every cell to that
// value (null planned = no profile; 0 actual = no site data).
const demoRow = (ProposalID, planned, actual) => {
  const row = { ProposalID }
  STEMS.forEach((s) => { row[`planned${s}`] = planned })
  STEMS.forEach((s) => { row[`actual${s}`] = actual })
  return row
}

function mockRes() {
  return {
    statusCode: null,
    body: undefined,
    status(code) { this.statusCode = code; return this },
    send(payload) { this.body = payload; return this },
  }
}

test('getDemographics: reads planned from StudyProfile + summed actual from StudySites, parameterized by ProposalID', async () => {
  const rows = [demoRow('146', '10', '19')]
  let capturedQuery
  let capturedParams
  db.any = async (q, params) => { capturedQuery = q; capturedParams = params; return rows }

  const res = mockRes()
  getDemographics({ params: { id: '146' } }, res)
  await flush()

  assert.match(capturedQuery, /FROM\s+\(SELECT \$1::bigint AS pid\) base/)
  assert.match(capturedQuery, /LEFT JOIN "StudyProfile"/)
  assert.match(capturedQuery, /FROM "StudySites"/)
  assert.match(capturedQuery, /SUM\("actualWhiteMale"\)/)
  assert.deepStrictEqual(capturedParams, ['146'])
  assert.strictEqual(res.statusCode, 200)
  assert.deepStrictEqual(res.body, rows)
})

test('getDemographics: returns [] when the study has neither planned nor actual demographics', async () => {
  // base dummy always yields one row: planned null (no profile), actual 0 (no sites).
  db.any = async () => [demoRow('999', null, 0)]

  const res = mockRes()
  getDemographics({ params: { id: '999' } }, res)
  await flush()

  assert.strictEqual(res.statusCode, 200)
  assert.deepStrictEqual(res.body, [])
})

test('getDemographics: returns the row when only actual (site) data exists, no profile', async () => {
  const rows = [demoRow('500', null, '7')]
  db.any = async () => rows

  const res = mockRes()
  getDemographics({ params: { id: '500' } }, res)
  await flush()

  assert.strictEqual(res.statusCode, 200)
  assert.deepStrictEqual(res.body, rows)
})

test('getDemographics: returns the row when only planned (profile) data exists, no site actuals', async () => {
  const rows = [demoRow('501', '12', 0)]
  db.any = async () => rows

  const res = mockRes()
  getDemographics({ params: { id: '501' } }, res)
  await flush()

  assert.strictEqual(res.statusCode, 200)
  assert.deepStrictEqual(res.body, rows)
})

test('getDemographics: returns 500 when the DB query fails', async () => {
  db.any = async () => { throw new Error('boom') }

  const res = mockRes()
  getDemographics({ params: { id: '146' } }, res)
  await flush()

  assert.strictEqual(res.statusCode, 500)
})
