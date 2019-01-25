const express = require('express')
const path = require('path');
const router = express.Router()

// "HOSTNAME/list" Route

// For services approved in first meeting
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../views/list.html'))
})

module.exports = router