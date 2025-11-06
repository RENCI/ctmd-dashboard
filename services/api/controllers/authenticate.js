const https = require('https')
const axios = require('axios')

// NOTE 2025-01-05: This controller handles the legacy /authenticate/v1/authorize endpoint
// that TIN uses for authentication after user clicks graphics on TIN website.
//
// AUTHENTICATION FLOW:
// 1. User logs into TIN
// 2. TIN displays CTMD graphics (fetched from /api/graphics/proposals-by-tic)
// 3. User clicks graphic on TIN site
// 4. TIN redirects to: redcap.vumc.org/plugins/TIN/sso/send_login?target-url=...
// 5. TIN redirects browser to: /authenticate/v1/authorize?apikey=...&code=...&return_url=...
// 6. This controller validates code, creates session, redirects to return_url
//
// FUTURE CONSIDERATION: The apikey parameter is a legacy security measure that may not
// be necessary. Modern OAuth flows typically don't require the client to send an API key
// during the authorization callback. Consider removing after discussion with TIN team.

const REDCAP_AUTH_URL = process.env.REDCAP_AUTH_URL
const FUSE_AUTH_API_KEY = process.env.FUSE_AUTH_API_KEY
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

/**
 * Legacy authentication endpoint for TIN integration
 * GET /authenticate/v1/authorize
 *
 * Query parameters:
 * - apikey: API key for authentication (validates against FUSE_AUTH_API_KEY)
 * - provider: Auth provider name (e.g., "venderbilt" - note the typo is intentional)
 * - code: OAuth authorization code from TIN SSO
 * - return_url: URL to redirect user after successful authentication
 * - redirect: Boolean flag (typically "true")
 */
exports.authorize = async (req, res) => {
  const { apikey, provider, code, return_url, redirect } = req.query

  // Validate API key
  // NOTE: This is a legacy security check. The apikey proves the request came from TIN,
  // but since the OAuth code itself is cryptographically secure and single-use, the apikey
  // adds minimal additional security. Consider removing in future iterations.
  if (apikey !== FUSE_AUTH_API_KEY) {
    console.error('Invalid API key provided to /authenticate/v1/authorize')
    return res.status(401).send('Unauthorized: Invalid API key')
  }

  // Validate required parameters
  if (!code) {
    return res.status(400).send('Bad Request: Missing code parameter')
  }

  if (!return_url) {
    return res.status(400).send('Bad Request: Missing return_url parameter')
  }

  // Validate code format
  if (!isValidAuthCode(code)) {
    return res.status(400).send('Invalid authorization code')
  }

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
    return res.redirect(return_url)
  }

  // Validate code with REDCap SSO
  const redcapUrl = `${REDCAP_AUTH_URL}?code=${code}`

  try {
    const response = await axios.get(redcapUrl, {
      httpsAgent: AGENT,
      timeout: 10000 // 10 second timeout
    })

    if (response.status === 200) {
      // Store user info in session
      const userData = response.data
      userData.authenticated = true
      req.session.auth_info = userData

      console.log(`User authenticated via /authenticate/v1/authorize: ${userData.username || 'unknown'}`)

      // Redirect to the return URL (typically the CTMD dashboard)
      res.redirect(return_url)
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
