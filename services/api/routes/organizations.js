const express = require('express')
const router = express.Router()
const organizationsController = require('../controllers/organizations')

// Routes beginning with "HOSTNAME/organizations/..."

router.route('/').get(organizationsController.list)

module.exports = router