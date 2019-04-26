const express = require('express')
const router = express.Router()
const studyMetricsController = require('../controllers/study-metrics')

// Routes beginning with "HOSTNAME/study-metrics/..."

router.route('/').post(studyMetricsController.post)
router.route('/').get(studyMetricsController.get)

module.exports = router