const express = require('express')
const router = express.Router()
const statusesController = require('../controllers/Statuses')

// Routes beginning with "HOSTNAME/stages/..."

router.route('/').get(statusesController.list)

module.exports = router