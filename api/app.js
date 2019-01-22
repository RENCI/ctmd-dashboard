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

// Endpoint List/Documentation
const DocumentationRoutes = require('./routes/Documentation')
app.use('/list', DocumentationRoutes)

// Proposals
const ProposalsRoutes = require('./routes/Proposals')
app.use('/proposals', ProposalsRoutes)

// Services
const ServiceRoutes = require('./routes/Services')
app.use('/services', ServiceRoutes)

// Stages
const StageRoutes = require('./routes/Stages')
app.use('/stages', StageRoutes)

// General
const GeneralRoutes = require('./routes/General')
app.use('/', GeneralRoutes)
