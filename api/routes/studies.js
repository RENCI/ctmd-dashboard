const express = require('express')
const router = express.Router()
const studiesController = require('../controllers/studies')

// Routes beginning with "HOSTNAME/study-profile/..."

// router.route('/').get(studiesController.get)

router.route('/:id(\\d+)').post(studiesController.uploadProfile)
router.route('/:id(\\d+)/sites').post(studiesController.uploadSites)
router.route('/:id(\\d+)/enrollment-data').post(studiesController.uploadEnrollmentData)

router.route('/:id(\\d+)').get(studiesController.getProfile)
router.route('/:id(\\d+)/sites').get(studiesController.getSites)
router.route('/:id(\\d+)/enrollment-data').get(studiesController.getEnrollmentData)

module.exports = router