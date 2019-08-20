const express = require('express')
const router = express.Router()
const studiesController = require('../controllers/studies')

// Routes beginning with "HOSTNAME/study-profile/..."

// router.route('/:id(\\d+)').post(studiesController.upload)
// router.route('/').get(studiesController.get)
router.route('/:id(\\d+)').get(studiesController.getProfile)
router.route('/:id(\\d+)/sites').get(studiesController.getSites)

module.exports = router