const express = require('express')
const router = express.Router()
const ctsasController = require('../controllers/sites')

// Routes beginning with "HOSTNAME/ctsas/..."

router.route('/').get(ctsasController.list)

module.exports = router