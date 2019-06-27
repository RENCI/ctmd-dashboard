const express = require('express')
const router = express.Router()
const siteMetricsController = require('../controllers/site-metrics')

// Routes beginning with "HOSTNAME/site-metrics/..."

router.route('/retrieve/:studyName').get(siteMetricsController.retrieve)

module.exports = router
