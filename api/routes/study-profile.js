const express = require('express')
const router = express.Router()
const studyProfileController = require('../controllers/study-profile')

// Routes beginning with "HOSTNAME/study-profile/..."

router.route('/').post(studyProfileController.post)
router.route('/').get(studyProfileController.get)
router.route('/profile').get(studyProfileController.profile)

module.exports = router