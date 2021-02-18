const express = require('express')
const https = require('https')
const app = express()
const cors = require('cors')
const db = require('./config/database')
var multer = require('multer')
const axios = require('axios')
// var cookieSession = require("cookie-session");
const session = require('express-session')

// Config
const AGENT = new https.Agent({
  rejectUnauthorized: false,
})
const NON_PROTECTED_ROUTES = ['/auth_status', '/auth', '/logout']

const PORT = process.env.API_PORT || 3030
const AUTH_API_KEY = 'TEST123' // process.env.FUSE_AUTH_API_KEY;
const DASHBOARD_URL = process.env.DASHBOARD_URL
const AUTH_URL = 'https://dev-auth-fuse.renci.org' // process.env.AUTH_URL;

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

app.use(async (req, res, next) => {
  const code = req.query.code
  const authInfo = typeof req.session.auth_info === 'undefined' ? {} : req.session.auth_info

  if (NON_PROTECTED_ROUTES.includes(req.path) || process.env.NODE_ENV === 'developments') {
    next()
  } else {
    if (Object.keys(authInfo).length) {
      req.session.touch()
      next()
    } else if (code) {
      axios
        .get(
          `${AUTH_URL}/v1/authorize?apikey=${AUTH_API_KEY}&provider=venderbilt&return_url=http://localhost:3030&code=${code}&redirect=True`,
          { httpsAgent: AGENT }
        )
        .then((response) => {
          if (response.status === 200) {
            next()
          }
        })
        .catch((err) => {
          res.status(err.request.res.statusCode).send(err.request.res.statusMessage)
        })
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
  res.status(200).send({ auth_info: authInfo })
})

// Auth
app.post('/auth', (req, res, next) => {
  const code = req.body.code

  if (!req.session.auth_info) {
    axios
      .get(`${AUTH_URL}/v1/authorize?apikey=${AUTH_API_KEY}&provider=venderbilt&return_url=${DASHBOARD_URL}&code=${code}&redirect=False`, {
        httpsAgent: AGENT,
      })
      .then((response) => {
        if (response.status === 200) {
          const data = response.data
          data.authenticated = true
          req.session.auth_info = data

          res.redirect(`${AUTH_URL}/v1/authorize?apikey=${AUTH_API_KEY}&provider=venderbilt&return_url=${DASHBOARD_URL}&code=${code}`)
          res.end()
        }
      })
      .catch((err) => {
        console.log(err)
        res.status(400).send('error')
      })
  } else {
    res.redirect(`${AUTH_URL}/v1/authorize?apikey=${AUTH_API_KEY}&provider=venderbilt&return_url=${DASHBOARD_URL}&code=${code}`)
  }
})

app.post('/logout', (req, res, next) => {
  console.log('in logout')
  req.session.destroy(function (err) {
    console.log(err)
  })
  console.log(req)
  res.end()
})

//sD6Ed9mDaL
