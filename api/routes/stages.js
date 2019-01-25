const express = require('express')
const router = express.Router()
const stagesController = require('../controllers/stages')

// Routes beginning with "HOSTNAME/stages/..."

router.route('/').get(stagesController.list)

module.exports = router