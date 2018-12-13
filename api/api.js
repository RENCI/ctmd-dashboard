const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const db = require('./src/config/database')

// Config
const PORT = 3030

// Tell me it's working!
app.listen(PORT, () => {
    console.log(`\nShhh... I'm listening on port ${PORT}.\n`)
})

// Routes
const Routes = require('./src/routes/Routes')
app.use('/api', Routes)

