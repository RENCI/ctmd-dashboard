const express = require('express')
const router = express.Router()
const graphicsController = require('../controllers/graphics')

// Routes beginning with "HOSTNAME/api/v1/graphics/..."

router.route('/bar/vertical').get(graphicsController.vertical)
router.route('/bar/horizontal').get(graphicsController.horizontal)

module.exports = router