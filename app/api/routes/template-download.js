const express = require('express')
const router = express.Router()
const templateDownloadController = require('../controllers/template-download')

// Routes beginning with "HOSTNAME/ctsas/..."

router.route('/:tableName').get(templateDownloadController.download)

module.exports = router