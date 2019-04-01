const express = require('express')
const router = express.Router()
const sitesController = require('../controllers/sites')

// Routes beginning with "HOSTNAME/site-metrics/..."

router.route('/').get(sitesController.list)
router.route('/reports').post(sitesController.addReport)

module.exports = router