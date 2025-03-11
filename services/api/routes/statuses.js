const express = require('express')
const router = express.Router()
const statusesController = require('../controllers/statuses')

// Routes beginning with "HOSTNAME/statuses/..."

router.route('/').get(statusesController.list)

module.exports = router