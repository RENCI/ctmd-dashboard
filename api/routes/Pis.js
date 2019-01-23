const express = require('express')
const router = express.Router()
const piController = require('../controllers/Pis')

// PIs
router.route('/').get(piController.list)

module.exports = router