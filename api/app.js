const express = require('express')
const app = express()
const cors = require('cors')
const db = require('./config/database')
var multer = require('multer')

// CORS
app.use(cors())

// Config
const PORT = process.env.API_PORT || 3030
const AUTH_API_KEY = process.env.FUSE_AUTH_API_KEY

// Tell me it's working!
app.listen(PORT, () => {
    console.log(`\nShhh... I'm listening on port ${PORT}.\n`)
})

// Custom Middleware - Route-Logging
const routeLogger = (req, res, next) => {
    console.log(`${ (new Date()).toTimeString() } :: HIT ${ req.path }`)
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
app.post('/auth', (req, res) => {
  const code = req.body.code
  console.log(`redirecting: https://auth-fuse.renci.org/v1/authorize?apikey=${ AUTH_API_KEY }&provider=venderbilt&return_url=https://stage-ctmd.renci.org/&code=${ code }`)
  res.redirect(`https://auth-fuse.renci.org/v1/authorize?apikey=${ AUTH_API_KEY }&provider=venderbilt&return_url=https://stage-ctmd.renci.org/&code=${ code }`)
})
