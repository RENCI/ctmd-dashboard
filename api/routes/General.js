const express = require('express')
const router = express.Router()
const controller = require('../controllers/QueryController')

// PIs
router.get('/pis', (req, res) => {
    query = `SELECT DISTINCT proposal_id, pi_firstname, pi_lastname, pi_name, pi_name_2 FROM "PI";`
    controller.runQuery(req, res, query)
})

module.exports = router