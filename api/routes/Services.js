const express = require('express')
const router = express.Router()
const servicesController = require('../controllers/Services')

// Routes beginning with "HOSTNAME/services/..."

router.route('/approval').get(servicesController.approvalServices)
router.route('/submission').get(servicesController.submissionServices)

module.exports = router