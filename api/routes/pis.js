const express = require('express')
const router = express.Router()
const piController = require('../controllers/pis')

// PIs
router.route('/').get(piController.list)

module.exports = router