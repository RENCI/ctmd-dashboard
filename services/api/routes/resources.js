const express = require('express')
const router = express.Router()
const resourcesController = require('../controllers/resources')

// Routes beginning with "HOSTNAME/resources/..."

router.route('/').get(resourcesController.list)
router.route('/requested').get(resourcesController.requestedResources)
router.route('/approved').get(resourcesController.approvedResources)

module.exports = router