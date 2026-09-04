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

function mockRes() {
  return {
    statusCode: null,
    body: undefined,
    status(code) {
      this.statusCode = code
      return this
    },
    send(payload) {
      this.body = payload
      return this
    },
  }
}

test('getDemographics: queries EnrollmentDemographics by ProposalID and returns the rows with 200', async () => {
  const rows = [{ ProposalID: '146', plannedHispanicFemale: '10', actualWhiteMale: '19' }]
  let capturedQuery
  db.any = async (q) => {
    capturedQuery = q
    return rows
  }

  const res = mockRes()
  getDemographics({ params: { id: '146' } }, res)
  await flush()

  assert.match(capturedQuery, /FROM "EnrollmentDemographics"/)
  assert.match(capturedQuery, /WHERE "ProposalID" = 146/)
  assert.strictEqual(res.statusCode, 200)
  assert.deepStrictEqual(res.body, rows)
})

test('getDemographics: passes through an empty result (study with no demographics) as 200 []', async () => {
  db.any = async () => []

  const res = mockRes()
  getDemographics({ params: { id: '999' } }, res)
  await flush()

  assert.strictEqual(res.statusCode, 200)
  assert.deepStrictEqual(res.body, [])
})

test('getDemographics: returns 500 when the DB query fails', async () => {
  db.any = async () => {
    throw new Error('boom')
  }

  const res = mockRes()
  getDemographics({ params: { id: '146' } }, res)
  await flush()

  assert.strictEqual(res.statusCode, 500)
})
