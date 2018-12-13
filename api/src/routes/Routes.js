const express = require('express')
const router = express.Router()
const db = require('../config/database')

// /api/... 

// Base
router.get('/', (req, res) => {
    console.log('HIT: /')
    res.status(200).send('OK!')
})

router.get('/services-approved-first-meeting', (req, res) => {
    query = 'SELECT service.proposal_id, service.services_approved, vote.meeting_date, funding.funding \
        FROM service \
        INNER JOIN vote ON service.proposal_id=vote.proposal_id \
        INNER JOIN funding \
        ON funding.proposal_id=vote.proposal_id \
        WHERE vote.meeting_date is not NULL \
        ORDER BY vote.meeting_date'
    db.any(query)
        .then(data => {
            console.log('HIT: /services-approved-first-meeting')
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
        })
})

router.get('/services-approved-second-meeting', (req, res) => {
    query = 'SELECT service.proposal_id, service.services_approved, vote.meeting_date, funding.funding \
        FROM service \
        INNER JOIN vote ON service.proposal_id=vote.proposal_id \
        INNER JOIN funding ON funding.proposal_id=vote.proposal_id \
        WHERE vote.meeting_date_2 is not NULL \
        ORDER BY vote.meeting_date_2;'
    db.any(query)
        .then(data => {
            console.log('HIT: /services-approved-first-meeting')
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
        })
})

router.get('/by-institution', (req, res) => {
    query = 'SELECT proposal.proposal_id, service.services_approved, proposal.tic_ric_assign_v2, funding.funding \
        FROM proposal \
        INNER JOIN service ON proposal.proposal_id=service.proposal_id \
        INNER JOIN funding ON funding.proposal_id=service.proposal_id \
        ORDER BY proposal.tic_ric_assign_v2;'
    db.any(query)
        .then(data => {
            console.log('HIT: /services-approved-first-meeting')
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
        })
})

module.exports = router