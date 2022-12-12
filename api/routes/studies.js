const express = require('express')
const router = express.Router()
const studiesController = require('../controllers/studies')

// Routes beginning with "HOSTNAME/studies/..."

router.route('/:id(\\d+)').get(studiesController.getProfile)
router.route('/:id(\\d+)/sites').get(studiesController.getSites)
router.route('/studysites').get(studiesController.getStudySites)
router.route('/:id(\\d+)/enrollment-data').get(studiesController.getEnrollmentData)

module.exports = router