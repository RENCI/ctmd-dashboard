const express = require('express')
const router = express.Router()
const studyProfileController = require('../controllers/study-profile')

// Routes beginning with "HOSTNAME/study-metrics/..."

router.route('/').post(studyProfileController.post)
router.route('/').get(studyProfileController.get)
router.route('/retrieve/:studyName').get(studyProfileController.retrieve)

module.exports = router