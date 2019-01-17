const express = require('express')
const router = express.Router()
const controller = require('../controllers/QueryController')
const proposalController = require('../controllers/Proposal')

// Routes beginning with "HOSTNAME/proposal/..."

router.route('/:id').get(proposalController.getOne)

module.exports = router