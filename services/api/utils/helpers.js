// Helper Functions
///////////////////

// Parse array-like string returned by Postgres into a real array
exports.stringToArray = (str) =>
  str
    .slice(1, -1)
    .split(',')
    .filter((el) => el != '')
// Helper function to sort proposals by proposal_id
exports.compareIds = (p, q) => (p.proposal_id < q.proposal_id ? -1 : 1)
// Convert string to CamelCase
exports.camelCase = (str) => {
  let string = str
    .toLowerCase()
    .replace(/[^A-Za-z0-9]/g, ' ')
    .split(' ')
    .reduce((result, word) => result + capitalize(word.toLowerCase()))
  return string.charAt(0).toLowerCase() + string.slice(1)
}
const capitalize = (str) => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1)

// Mask a short-lived SSO code for logging — enough to correlate requests
// without writing the full single-use token to logs.
exports.maskCode = (code) => {
  if (!code) return '(none)'
  const s = String(code)
  return s.length <= 4 ? `${s.length}chars` : `${s.slice(0, 3)}…${s.slice(-2)} (${s.length}chars)`
}

// Describe a REDCap SSO validation failure for logs. Includes the HTTP status
// and response body REDCap returned (e.g. {"error":"Error: Code is invalid"}),
// which axios errors otherwise hide behind a generic "status code 403".
exports.describeRedcapError = (err) => {
  if (err.response) {
    let body = err.response.data
    try {
      body = typeof body === 'string' ? body : JSON.stringify(body)
    } catch (e) {
      body = '(unserializable body)'
    }
    return `status=${err.response.status} body=${body}`
  }
  return `no response (${err.code || err.message})`
}
