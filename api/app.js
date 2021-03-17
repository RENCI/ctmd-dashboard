const express = require('express')
const https = require('https')
const app = express()
const cors = require('cors')
const db = require('./config/database')
var multer = require('multer')
const axios = require('axios')
const session = require('express-session')
const { getHealUsers, checkIfIsHealUser } = require('./utils/helpers')

// Config
const AGENT = new https.Agent({
  rejectUnauthorized: false,
})
const NON_PROTECTED_ROUTES = ['/auth_status', '/auth', '/logout']
const PORT = process.env.API_PORT || 3030
const AUTH_API_KEY = process.env.FUSE_AUTH_API_KEY
const DASHBOARD_URL = process.env.DASHBOARD_URL
const AUTH_URL = process.env.AUTH_URL
const isHealServer = process.env.IS_HEAL_SERVER || false
const HEAL_USERS = isHealServer ? getHealUsers('./heal-users.txt') : []

// CORS
app.use(cors({ origin: 'http://localhost:3000', credentials: true }))

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

// ${AUTH_URL}/v1/authorize?apikey=${AUTH_API_KEY}&provider=venderbilt&return_url=http://localhost:3030&code=${code}&redirect=alse
app.use(async (req, res, next) => {
  const code = req.query.code
  const authInfo = typeof req.session.auth_info === 'undefined' ? {} : req.session.auth_info
  const url = `https://redcap.vanderbilt.edu/plugins/TIN/sso/check_login?code=${code}`
  if (NON_PROTECTED_ROUTES.includes(req.path) || process.env.NODE_ENV === 'developments') {
    next()
  } else {
    if (Object.keys(authInfo).length) {
      req.session.touch()
      next()
    } else if (code) {
      try {
        const response = await axios.get(url, { httpsAgent: AGENT })
        if (response.status === 200) {
          next()
        } else {
        }
      } catch (err) {
        res.status(err.request.res.statusCode).send(err.request.res.statusMessage)
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

app.get('/auth_status', (req, res, next) => {
  const authInfo = typeof req.session.auth_info === 'undefined' ? {} : req.session.auth_info
  let statusCode = Object.keys(authInfo).length ? 200 : 401
  let data = authInfo

  if (isHealServer) {
    let healData = checkIfIsHealUser(req, HEAL_USERS)
    // If the user isn't authorized that code should take precedence over heal user status check
    statusCode = statusCode == 401 ? statusCode : healData.statusCode
    data = { ...authInfo, ...healData.data }
  }

  res.status(statusCode).send(data)
})

app.get('/is_heal_user', (req, res, next) => {
  const data = checkIfIsHealUser(req, HEAL_USERS)
  res.status(data.statusCode).send(data.data)
})

// Auth
app.post('/auth', async (req, res, next) => {
  const code = req.body.code
  const urlRedirect = `${AUTH_URL}/v1/authorize?apikey=${AUTH_API_KEY}&provider=venderbilt&return_url=${DASHBOARD_URL}&code=${code}&redirect=true`
  const urlNoRedirect = `${AUTH_URL}/v1/authorize?apikey=${AUTH_API_KEY}&provider=venderbilt&return_url=${DASHBOARD_URL}&code=${code}&redirect=false`

  if (!req.session.auth_info) {
    const response = await axios.get(urlNoRedirect, { httpsAgent: AGENT })
    try {
      if (response.status === 200) {
        const data = response.data
        data.authenticated = true
        req.session.auth_info = data

        res.redirect(urlRedirect)
        res.end()
      }
    } catch (err) {
      console.log(err)
      res.status(400).send('error')
    }
  } else {
    res.redirect(urlRedirect)
  }
})

app.post('/logout', (req, res, next) => {
  res.cookie('express.sid', '', { expires: new Date() })
  req.session.destroy(function (err) {
    console.log('ERROR', err)
  })
  res.end()
})
