const express = require('express')
const https = require('https')
const app = express()
const cors = require('cors')
const db = require('./config/database')
var multer = require('multer')
const session = require('express-session')
const axios = require('axios')
const { getHealUsers, checkIfIsHealUser } = require('./utils/helpers')

// Config
const AGENT = new https.Agent({
  rejectUnauthorized: false,
})
const NON_PROTECTED_ROUTES = ['/auth_status', '/auth', '/logout']
const PORT = process.env.API_PORT || 3030
const isHealServer = process.env.IS_HEAL_SERVER === 'true' || false
const HEALUsersFilePath = process.env.HEAL_USERS_FILE_PATH || './heal-users.txt'
const HEAL_USERS = isHealServer ? getHealUsers(HEALUsersFilePath) : []
const REDCAP_AUTH_URL = process.env.REDCAP_AUTH_URL
// CORS
// app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(cors({ origin: '*', credentials: true }))

// session
app.use(
  session({
    secret: process.env.API_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: 12 * 60 * 60 * 1000,
    },
  })
)

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

// Authentication middleware
app.use(async (req, res, next) => {
  const code = req.query.code
  const authInfo = typeof req.session.auth_info === 'undefined' ? {} : req.session.auth_info

  // Skip auth for non-protected routes or development mode
  if (NON_PROTECTED_ROUTES.includes(req.path) || process.env.AUTH_ENV === 'development') {
    next()
  } else {
    // User already authenticated
    if (Object.keys(authInfo).length) {
      req.session.touch() // renew session
      next()
    } else if (code) {
      // Validate code parameter
      if (!isValidAuthCode(code)) {
        return res.status(400).send('Invalid authorization code')
      }

      // Verify code with REDCap SSO
      const redcapUrl = `${REDCAP_AUTH_URL}?code=${code}`
      try {
        const response = await axios.get(redcapUrl, {
          httpsAgent: AGENT,
          timeout: 10000 // 10 second timeout
        })

        if (response.status === 200) {
          next()
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
    } else {
      res.status(401).send('Please login')
    }
  }
})

// Tell me it's working!
app.listen(PORT, () => {
  console.log(`\nShhh... I'm listening on port ${PORT}.\n`)
})

// Custom Middleware - Route-Logging
const routeLogger = (req, res, next) => {
  console.log(`${new Date().toTimeString()} :: HIT ${req.path}`)
  next()
}
app.use(routeLogger)

// Middleware Parse request body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(multer().array())

// // // Routes // // //

// Proposals
app.use('/proposals', require('./routes/proposals'))
// Proposal Statuses
app.use('/statuses', require('./routes/statuses'))
// Resources
app.use('/resources', require('./routes/resources'))
// PIs
app.use('/pis', require('./routes/pis'))
// TICs
app.use('/tics', require('./routes/tics'))
// Organizations
app.use('/organizations', require('./routes/organizations'))
// Therapeutic Area
app.use('/therapeutic-areas', require('./routes/therapeutic-areas'))
// Studies
app.use('/studies', require('./routes/studies'))
// Sites
app.use('/sites', require('./routes/sites'))
// CTSAs
app.use('/ctsas', require('./routes/ctsas'))
// CTSAs
app.use('/template', require('./routes/template-download'))

// Graphics
app.use('/graphics', require('./routes/graphics'))

// Auth
app.use('/auth', require('./routes/auth'))

app.get('/auth_status', (req, res) => {
  const authInfo = typeof req.session.auth_info === 'undefined' ? {} : req.session.auth_info
  let statusCode = Object.keys(authInfo).length ? 200 : 401
  let data = authInfo
  if (process.env.AUTH_ENV === 'development') {
    statusCode = 200
    data = {
      access_level: '1',
      email: 'test@example.com',
      first_name: 'demo',
      last_name: 'user',
      organization: 'demo server',
      username: 'demo',
      authenticated: true,
    }
  }

  if (isHealServer) {
    let healData = checkIfIsHealUser(req, HEAL_USERS)
    data = { ...authInfo, ...healData.data }
  }

  res.status(statusCode).send(data)
})

app.get('/is_heal_user', (req, res, next) => {
  const data = checkIfIsHealUser(req, HEAL_USERS)
  res.status(data.statusCode).send(data.data)
})

app.post('/logout', (req, res, next) => {
  res.cookie('express.sid', '', { expires: new Date() })
  req.session.destroy(function (err) {
    console.log('ERROR', err)
  })
  res.end()
})
