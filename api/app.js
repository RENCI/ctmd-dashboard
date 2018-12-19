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

// // // Routes // // //

// Endpoint List/Documentation
const DocumentationRoutes = require('./routes/Documentation')
app.use('/list', DocumentationRoutes)

// Proposals
const ProposalRoutes = require('./routes/Proposals')
app.use('/proposals', ProposalRoutes)

// General
const GeneralRoutes = require('./routes/General')
app.use('/', GeneralRoutes)
