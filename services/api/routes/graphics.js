const express = require('express')
const router = express.Router()
const graphicsController = require('../controllers/graphics')

// Routes beginning with "HOSTNAME/api/graphics/..."

// Branded RENCI/CTMD card — embedded by the TIN site on its login callback.
router.route('/proposals-by-tic').get(graphicsController.ctmdCard)
// Live "proposals by TIC" figure (5 status groups) — embedded on the CTMD home dashboard.
router.route('/proposals-by-tic-chart').get(graphicsController.proposalsByTic)

module.exports = router