const express = require('express')
const router = express.Router()
const servicesController = require('../controllers/services')

// Routes beginning with "HOSTNAME/services/..."

router.route('/').get(servicesController.list)
router.route('/approval').get(servicesController.approvalServices)
router.route('/submission').get(servicesController.submissionServices)

module.exports = router