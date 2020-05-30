const express = require('express')
const router = express.Router()
const graphicsController = require('../controllers/graphics')

// Routes beginning with "HOSTNAME/api/graphics/..."

router.route('/proposals-by-tic').get(graphicsController.proposalsByTic)

module.exports = router