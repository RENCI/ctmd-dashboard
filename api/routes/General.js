const express = require('express')
const router = express.Router()
const controller = require('../controllers/QueryController')

// PIs
router.get('/pis', (req, res) => {
    query = `SELECT DISTINCT *
        FROM "PI";`
    controller.runQuery(req, res, query)
})

module.exports = router