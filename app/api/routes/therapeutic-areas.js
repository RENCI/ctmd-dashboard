const express = require('express')
const router = express.Router()
const therapeuticAreasController = require('../controllers/therapeutic-areas')

// Routes beginning with "HOSTNAME/therapeutic-areas/..."

router.route('/').get(therapeuticAreasController.list)

module.exports = router