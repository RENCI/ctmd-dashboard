const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth')

router.route('/').post(authController.auth)

module.exports = router
