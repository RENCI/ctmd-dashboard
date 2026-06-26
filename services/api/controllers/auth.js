const https = require('https')
const axios = require('axios')

const REDCAP_AUTH_URL = process.env.REDCAP_AUTH_URL
const DASHBOARD_URL = process.env.DASHBOARD_URL
const AGENT = new https.Agent({
  rejectUnauthorized: false,
})

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
  // NOTE 2025-01-05: REDCap POSTs form data with the code, so read from body
  // Production flow: REDCap form POST → /api/auth validates → creates session → redirects to dashboard
  const code = req.body.code

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
    console.error('Invalid authorization code received')
    return res.status(400).send('Invalid authorization code')
  }

  // Skip if already authenticated with a valid session (proper object with authenticated: true).
  // Old sessions may have auth_info = "1" (string from REDCap) which is truthy but not a valid
  // session object — those should fall through to fresh auth so a proper session is created.
  const hasValidSession = (
    req.session.auth_info !== null &&
    req.session.auth_info !== undefined &&
    typeof req.session.auth_info === 'object' &&
    !Array.isArray(req.session.auth_info) &&
    req.session.auth_info.authenticated === true
  )
  if (hasValidSession) {
    console.log(`User already authenticated: ${req.session.auth_info.username || req.session.auth_info.email || 'unknown'}`)
    res.redirect(DASHBOARD_URL)
    return
  }
  // Clear any stale/invalid session data so we get a fresh session below
  if (req.session.auth_info !== undefined) {
    console.log(`Clearing stale session (auth_info type: ${typeof req.session.auth_info}), proceeding with fresh auth`)
    req.session.auth_info = undefined
  }

  // Validate code with REDCap SSO
  // NOTE 2025-01-05: This is the critical security validation - we verify the code
  // with REDCap to ensure it's legitimate before trusting any user information
  const redcapUrl = `${REDCAP_AUTH_URL}?code=${code}`

  try {
    const response = await axios.get(redcapUrl, {
      httpsAgent: AGENT,
      timeout: 10000 // 10 second timeout
    })

    if (response.status === 200) {
      // REDCap validated the code and returned user info.
      // Guard: if REDCap returns a non-object (e.g. a plain string like "1"),
      // userData.authenticated = true would silently fail on the primitive, so
      // we normalise to a plain object first.
      const raw = response.data
      const userData = (typeof raw === 'object' && raw !== null && !Array.isArray(raw))
        ? raw
        : {}
      userData.authenticated = true
      req.session.auth_info = userData

      console.log(`User authenticated: ${userData.username || userData.email || 'unknown'}, keys: [${Object.keys(userData).join(', ')}]`)

      // Redirect to dashboard - user is now logged in
      res.redirect(DASHBOARD_URL)
    } else {
      console.error(`REDCap authentication failed with status: ${response.status}`)
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
