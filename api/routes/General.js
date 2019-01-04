const express = require('express')
const router = express.Router()
const controller = require('../controllers/QueryController')

// PIs
router.get('/pis', (req, res) => {
    query = `SELECT DISTINCT * FROM "PI";`
    controller.runQuery(req, res, query)
})

// Name & dscription, given name -- from dropdowns
router.get('/name/:id', (req, res) => {
    query = `SELECT * FROM name WHERE id='${req.params.id}';`
    controller.runQuery(req, res, query)
})

// Names & dscriptions, given name -- from dropdowns
router.get('/name/like/:id', (req, res) => {
    query = `SELECT * FROM name WHERE id like '${req.params.id}%';`
    controller.runQuery(req, res, query)
})

module.exports = router