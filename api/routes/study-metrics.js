const express = require('express')
const router = express.Router()
const metricsController = require('../controllers/study-metrics')

// Routes beginning with "HOSTNAME/site-metrics/..."

router.route('/').post(metricsController.post)
router.route('/').get(metricsController.get)

module.exports = router