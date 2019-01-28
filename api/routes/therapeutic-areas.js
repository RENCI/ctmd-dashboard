const express = require('express')
const router = express.Router()
const therapeuticAreasController = require('../controllers/therapeutic-areas')

// Routes beginning with "HOSTNAME/stages/..."

router.route('/').get(therapeuticAreasController.list)

module.exports = router