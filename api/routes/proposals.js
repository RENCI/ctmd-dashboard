const express = require('express')
const router = express.Router()
const proposalsController = require('../controllers/proposals')

// Routes beginning with "HOSTNAME/proposals/..."

router.route('/').get(proposalsController.list)
router.route('/:id(\\d+)').get(proposalsController.getOne)
router.route('/by-submitted-service').get(proposalsController.bySubmittedService)
router.route('/by-status').get(proposalsController.byStatus)
router.route('/by-tic').get(proposalsController.byTic)
router.route('/by-organization').get(proposalsController.byOrganization)
router.route('/by-therapeutic-area').get(proposalsController.byTherapeuticArea)
router.route('/by-date').get(proposalsController.byDate)
router.route('/approved-services').get(proposalsController.approvedServices)
router.route('/submitted-services').get(proposalsController.submittedServices)
router.route('/network').get(proposalsController.proposalsNetwork)

router.route('/submitted-for-services/count').get(proposalsController.countSubmittedForServices)
router.route('/submitted-for-services/count/by-institution').get(proposalsController.countSubmittedForServicesByInstitution)
router.route('/submitted-for-services/count/by-tic').get(proposalsController.countSubmittedForServicesByTic)
router.route('/submitted-for-services/count/by-therapeutic-area').get(proposalsController.countSubmittedForServicesByTherapeuticArea)
router.route('/submitted-for-services/count/by-year').get(proposalsController.countSubmittedForServicesByYear)
router.route('/submitted-for-services/count/by-month').get(proposalsController.countSubmittedForServicesByMonth)

router.route('/resubmissions').get(proposalsController.resubmissions)
router.route('/resubmissions/count').get(proposalsController.countResubmissions)
router.route('/resubmissions/count/by-institution').get(proposalsController.countResubmissionsByInstitution)
router.route('/resubmissions/count/by-tic').get(proposalsController.countResubmissionsByTic)
router.route('/resubmissions/count/by-therapeutic-area').get(proposalsController.countResubmissionsByTherapeuticArea)

router.route('approved-for-services/count').get(proposalsController.countApprovedForServices)
router.route('approved-for-services/count/by-institution').get(proposalsController.countApprovedForServicesByInstitution)
router.route('approved-for-services/count/by-tic').get(proposalsController.countApprovedForServicesByTic)
router.route('approved-for-services/count/by-therapeutic-area').get(proposalsController.countApprovedForServicesByTherapeuticArea)
router.route('approved-for-services/count/by-year').get(proposalsController.countApprovedForServicesByYear)
router.route('approved-for-services/count/by-month').get(proposalsController.countApprovedForServicesByMonth)

module.exports = router