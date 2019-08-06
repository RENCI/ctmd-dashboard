const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const db = require('./config/database')

// CORS
app.use(cors())

// Config
const PORT = process.env.API_PORT || 3030

// Tell me it's working!
app.listen(PORT, () => {
    console.log(`\nShhh... I'm listening on port ${PORT}.\n`)
})

// Custom Middleware - Route-Logging
const routeLogger = (req, res, next) => {
    console.log(`HIT: ${ req.path }`)
    next()
}
app.use(routeLogger)

// Middleware Parse request body
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// // // Routes // // //

// Proposals
app.use('/proposals', require('./routes/proposals'))
// Proposal Statuses
app.use('/statuses', require('./routes/statuses'))
// Services
app.use('/services', require('./routes/services'))
// PIs
app.use('/pis', require('./routes/pis'))
// TICs
app.use('/tics', require('./routes/tics'))
// Organizations
app.use('/organizations', require('./routes/organizations'))
// Therapeutic Area
app.use('/therapeutic-areas', require('./routes/therapeutic-areas'))
// Study Metrics
app.use('/study-metrics', require('./routes/study-metrics'))
// Study Profile
app.use('/study-profile', require('./routes/study-profile'))
// Site Metrics
app.use('/site-metrics', require('./routes/site-metrics'))
// Sites
app.use('/sites', require('./routes/sites'))
// CTSAs
app.use('/ctsas', require('./routes/ctsas'))

// Endpoint List/Documentation
app.use('/list', require('./routes/documentation'))
