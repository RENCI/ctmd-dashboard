const express = require('express')
const router = express.Router()
const controller = require('../controllers/QueryController')
const proposalsController = require('../controllers/Proposals')

// Routes beginning with "HOSTNAME/proposals/..."

// router.route('/approved').get(proposalsController.approved)
router.route('/approved-services').get(proposalsController.approvedServices)
// router.route('/submitted').get(proposalsController.submitted)
router.route('/submitted-services').get(proposalsController.submittedServices)
router.route('/network').get(proposalsController.proposalsNetwork)

module.exports = router