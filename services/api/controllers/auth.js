const https = require('https')
const axios = require('axios')

const REDCAP_AUTH_URL = process.env.REDCAP_AUTH_URL
const DASHBOARD_URL = process.env.DASHBOARD_URL
const AGENT = new https.Agent({
  rejectUnauthorized: false,
})

console.log(JSON.stringify(process.env, null, 2))

/**
 * Sanitize authorization code to prevent injection attacks
 * @param {string} code - Authorization code from external provider
 * @returns {boolean} - True if code is valid
 */
function isValidAuthCode(code) {
  if (!code) return false
  if (code.length > 512) return false
  // Check for forbidden characters
  if (/[\n\r\0]/.test(code)) return false
  return true
}

exports.auth = async (req, res) => {
  const code = req.query.code // req.body.code

  // Development mode bypass
  if (process.env.AUTH_ENV === 'development') {
    const data = {
      access_level: '1',
      email: 'dev@email.com',
      first_name: 'demo',
      last_name: 'user',
      organization: 'demo server',
      username: 'demo',
      authenticated: true,
    }
    req.session.auth_info = data
    res.redirect(DASHBOARD_URL)
    return
  }

  // Validate code parameter
  if (!isValidAuthCode(code)) {
    return res.status(400).send('Invalid authorization code')
  }

  // Skip if already authenticated
  if (req.session.auth_info) {
    res.redirect(DASHBOARD_URL)
    return
  }

  // Call REDCap SSO directly
  const redcapUrl = `${REDCAP_AUTH_URL}?code=${code}`

  try {
    const response = await axios.get(redcapUrl, {
      httpsAgent: AGENT,
      timeout: 10000 // 10 second timeout
    })

    if (response.status === 200) {
      const data = response.data
      data.authenticated = true
      req.session.auth_info = data
      res.redirect(DASHBOARD_URL)
    } else {
      res.status(response.status).send('Authentication failed')
    }
  } catch (err) {
    console.error('REDCap authentication error:', err.message)

    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
      res.status(504).send('Authentication provider timeout')
    } else if (err.response) {
      res.status(err.response.status).send('Authentication failed')
    } else {
      res.status(502).send('Failed to connect to authentication provider')
    }
  }
}
