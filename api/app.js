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

// // // Routes // // //

// Proposals
app.use('/proposals', require('./routes/Proposals'))
// PIs
app.use('/pis', require('./routes/Pis'))
// Services
app.use('/services', require('./routes/Services'))
// Stages
app.use('/stages', require('./routes/Stages'))
// Organizations
app.use('/organizations', require('./routes/Organizations'))

// Endpoint List/Documentation
app.use('/list', require('./routes/Documentation'))
