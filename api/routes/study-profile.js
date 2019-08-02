const express = require('express')
const router = express.Router()
const studyProfileController = require('../controllers/study-profile')

// Routes beginning with "HOSTNAME/study-profile/..."

router.route('/:id(\\d+)').post(studyProfileController.upload)
// router.route('/').get(studyProfileController.get)
router.route('/:id(\\d+)').get(studyProfileController.profile)

module.exports = router