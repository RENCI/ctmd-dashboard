const express = require('express')
const router = express.Router()
const graphicsController = require('../controllers/graphics')

// Routes beginning with "HOSTNAME/studies/..."

router.route('/').get(graphicsController.proofOfConcept)

module.exports = router