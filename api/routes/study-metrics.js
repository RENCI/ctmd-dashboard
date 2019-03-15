const express = require('express')
const router = express.Router()
const metricsController = require('../controllers/study-metrics')

// Routes beginning with "HOSTNAME/site-metrics/..."

router.route('/').get(metricsController.list)
router.route('/').post(metricsController.post)

module.exports = router