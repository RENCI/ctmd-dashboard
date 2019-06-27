const express = require('express')
const router = express.Router()
const utahRecommendationController = require('../controllers/utah-rec')

// Routes beginning with "HOSTNAME/study-metrics/..."

router.route('/').post(utahRecommendationController.post)
router.route('/').get(utahRecommendationController.get)
router.route('/retrieve/:studyName').get(utahRecommendationController.retrieve)

module.exports = router