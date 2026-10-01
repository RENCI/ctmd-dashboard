const { test } = require('node:test')
const assert = require('node:assert')

const { ctmdCard } = require('./graphics')

function mockRes() {
  return {
    statusCode: null,
    contentType: null,
    body: undefined,
    status(code) {
      this.statusCode = code
      return this
    },
    type(value) {
      this.contentType = value
      return this
    },
    send(payload) {
      this.body = payload
      return this
    },
  }
}

test('ctmdCard: returns a 700x330 SVG drawing the outlined card lockup', () => {
  const res = mockRes()
  ctmdCard({}, res)

  assert.strictEqual(res.statusCode, 200)
  assert.strictEqual(res.contentType, 'image/svg+xml')
  assert.match(res.body, /^<svg[^>]*width="700"[^>]*height="330"/)
  assert.match(res.body, /class="branding"[^>]*viewBox="0 0 1807.25 695"/)
  assert.doesNotMatch(res.body, /<text/)
})
