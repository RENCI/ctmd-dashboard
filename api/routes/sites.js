const express = require('express')
const router = express.Router()
const sitesController = require('../controllers/sites')

// Routes beginning with "HOSTNAME/sites/..."

router.route('/').get(sitesController.list)
router.route('/reports').post(sitesController.addReport)

module.exports = router