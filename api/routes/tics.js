const express = require('express')
const router = express.Router()
const ticsController = require('../controllers/tics')

// Routes beginning with "HOSTNAME/stages/..."

router.route('/').get(ticsController.list)

module.exports = router