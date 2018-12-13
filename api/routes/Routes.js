const express = require('express')
const router = express.Router()
const db = require('../config/database')
const User = require('../controllers/Controller')

// /api/... 

// Base
router.get('/', (req, res) => {
    console.log('HIT: /')
    res.status(200).send('OK!')
})

// // // // // // // // // // // // // // // // // // // // // //
// // // Approved by the PAT for a <service – i.e. CIRB> // // //
// // // // // // // // // // // // // // // // // // // // // //

// // 
// // By Fiscal Year (July 1, 2016 – June 30, 2017 (Year1), July 1, 2017 – June 30, 2018 (Year2) . . . )
// // 

// For services approved in first meeting
router.get('/approvals/by-year/first-meeting', (req, res) => {
    query = 'SELECT service.proposal_id, service.services_approved, vote.meeting_date, funding.funding \
        FROM service \
                INNER JOIN vote ON service.proposal_id=vote.proposal_id \
                INNER JOIN funding \
        ON funding.proposal_id=vote.proposal_id \
                WHERE vote.meeting_date is not NULL \
        ORDER BY vote.meeting_date'
    run_query(req, res, query)
})

// For services approved in second meeting:
router.get('/approvals/by-year/second-meeting', (req, res) => {
    query = 'SELECT service.proposal_id, service.services_approved, vote.meeting_date, funding.funding \
        FROM service \
                INNER JOIN vote ON service.proposal_id=vote.proposal_id \
                INNER JOIN funding ON funding.proposal_id=vote.proposal_id \
                WHERE vote.meeting_date_2 is not NULL \
        ORDER BY vote.meeting_date_2;'
    run_query(req, res, query)
})

// // 
// // By Month
// // 

// For services approved in first meeting:
router.get('/approvals/by-month/first-meeting', (req, res) => {
    query = 'SELECT service.proposal_id, service.services_approved,vote.meeting_date,EXTRACT (YEAR FROM vote.meeting_date) as year, EXTRACT(MONTH FROM vote.meeting_date) as month, funding.funding FROM service \
                INNER JOIN vote on service.proposal_id = vote.proposal_id \
                INNER JOIN funding ON funding.proposal_id=vote.proposal_id \
                WHERE vote.meeting_date is not NULL ORDER BY year, month;'
    run_query(req, res, query)
})
// For services approved in second meeting:
router.get('/approvals/by-month/second-meeting', (req, res) => {
    query = 'SELECT service.proposal_id, service.services_approved,vote.meeting_date_2,EXTRACT (YEAR FROM vote.meeting_date_2) as year, EXTRACT(MONTH FROM vote.meeting_date_2) as month, funding.funding FROM service \
                INNER JOIN vote on service.proposal_id = vote.proposal_id \
                INNER JOIN funding ON funding.proposal_id=vote.proposal_id \
                WHERE vote.meeting_date_2 is not NULL ORDER BY year, month;'
    run_query(req, res, query)
})

// // 
// // By Institution Submitted
// // 

router.get('/approvals/by-submitting-institution', (req, res) => {
    query = 'SELECT DISTINCT proposal.proposal_id, service.services_approved, proposal.org_name, funding.funding FROM proposal \
                INNER JOIN service ON proposal.proposal_id=service.proposal_id \
                INNER JOIN funding ON funding.proposal_id=service.proposal_id ORDER BY proposal.org_name;'
    run_query(req, res, query)
})

// // 
// // By Institution assigned to (i.e. which TIC/RIC)
// // 

router.get('/approvals/by-assigned-institution', (req, res) => {
    query = 'SELECT proposal.proposal_id, service.services_approved, proposal.tic_ric_assign_v2, funding.funding \
        FROM proposal \
        INNER JOIN service ON proposal.proposal_id=service.proposal_id \
        INNER JOIN funding ON funding.proposal_id=service.proposal_id \
        ORDER BY proposal.tic_ric_assign_v2;'
    run_query(req, res, query)
})

// // 
// // By Therapeutic Area
// // 

router.get('/approvals/by-therapeutic-area', (req, res) => {
    query = 'SELECT DISTINCT service.proposal_id, service.services_approved, study.therapeutic_area, funding.funding \
        FROM service \
        INNER JOIN study ON service.proposal_id=study.proposal_id \
        INNER JOIN funding ON funding.proposal_id=study.proposal_id \
        ORDER BY study.therapeutic_area;'
    run_query(req, res, query)
})

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
// Submitted for a <service – i.e. CIRB – for ‘other’ should be noted combined as well as each item separate if possible’> //
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

// // 
// // By Fiscal Year (July 1, 2016 – June 30, 2017 (Year1), July 1, 2017 – June 30, 2018 (Year2) . . . )
// // 
router.get('/submissions/by-year', (req, res) => {
    query = 'SELECT proposal.proposal_id, proposal.new_service_selection, proposal.planned_submission_date, funding.funding \
        FROM proposal \
        INNER JOIN funding on proposal.proposal_id = funding.proposal_id \
        ORDER BY proposal.planned_submission_date ;'
    run_query(req, res, query)
})
// // 
// // By Month
// // 
router.get('/submissions/by-month', (req, res) => {
    query = 'SELECT proposal.proposal_id, proposal.new_service_selection,proposal.planned_submission_date, \
        EXTRACT (YEAR FROM proposal.planned_submission_date) as YEAR, \
        EXTRACT(MONTH FROM proposal.planned_submission_date) as month, funding.funding \
        FROM proposal \
        INNER JOIN funding on proposal.proposal_id = funding.proposal_id \
        ORDER BY YEAR, MONTH;'
    run_query(req, res, query)
})
// // 
// // By Institution submitted
// // 
router.get('/submissions/by-submitting-institution', (req, res) => {
    query = 'SELECT DISTINCT proposal.proposal_id, proposal.new_service_selection, proposal.org_name, funding.funding \
        FROM proposal \
        INNER JOIN funding ON proposal.proposal_id=funding.proposal_id \
        ORDER BY proposal.org_name;'
    run_query(req, res, query)
})
// // 
// // By Institution assigned to (i.e. which TIC/RIC)
// // 
router.get('/submissions/by-assigned-institution', (req, res) => {
    query = 'SELECT DISTINCT proposal.proposal_id,proposal.new_service_selection, proposal.tic_ric_assign_v2, funding.funding \
        FROM proposal \
        INNER JOIN funding ON proposal.proposal_id=funding.proposal_id \
        ORDER BY proposal.tic_ric_assign_v2;'
    run_query(req, res, query)
})
// // 
// // By Therapeutic Area
// // 
router.get('/submissions/by-therapeutic-area', (req, res) => {
    query = 'SELECT DISTINCT proposal.proposal_id,proposal.new_service_selection, study.therapeutic_area, funding.funding \
        FROM proposal \
        INNER JOIN study ON proposal.proposal_id=study.proposal_id \
        INNER JOIN funding ON funding.proposal_id=study.proposal_id ORDER BY study.therapeutic_area;'
    run_query(req, res, query)
})

// // // // // // // // // // // // // // // // // //
// Approved by PAT for Comprehensive Consultation  //
// // // // // // // // // // // // // // // // // //

// // 
// // Overall
// // 
router.get('/approved-for-consultation', (req, res) => {
    query = ''
    run_query(req, res, query)
})
// // 
// // By Fiscal Year (July 1, 2016 – June 30, 2017 (Year1), July 1, 2017 – June 30, 2018 (Year2) . . . )
// // 
router.get('/approved-for-consultation/by-year', (req, res) => {
    query = 'SELECT proposal.proposal_id, service.services_approved, proposal.year_icc, funding.funding \
        FROM proposal \
        INNER JOIN service ON proposal.proposal_id=service.proposal_id \
        INNER JOIN funding ON funding.proposal_id=service.proposal_id \
        WHERE proposal.gsu_com_2=‘1‘ \
        ORDER BY proposal.year_icc;'
    run_query(req, res, query)
})
// // 
// // By Month
// // 
router.get('/approved-for-consultation/by-month', (req, res) => {
    query = 'SELECT proposal.proposal_id, service.services_approved, proposal.month_icc, funding.funding \
        FROM proposal \
        INNER JOIN service ON proposal.proposal_id=service.proposal_id \
        INNER JOIN funding ON funding.proposal_id=service.proposal_id \
        WHERE proposal.gsu_com_2=‘1‘ \
            ORDER BY proposal.month_icc;'
    run_query(req, res, query)
})
// // 
// // By Institution submitted
// // 
router.get('/approved-for-consultation/by-submitting-institution', (req, res) => {
    query = 'SELECT DISTINCT proposal.proposal_id, service.services_approved, proposal.org_name, funding.funding \
        FROM proposal \
        INNER JOIN service ON proposal.proposal_id=service.proposal_id \
        INNER JOIN funding ON funding.proposal_id=service.proposal_id \
        WHERE proposal.gsu_com_2=‘1‘ \
        ORDER BY proposal.org_name;'
    run_query(req, res, query)
})
// // 
// // By Institution assigned to (i.e. which TIC/RIC)
// // 
router.get('/approved-for-consultation/by-assigned-institution', (req, res) => {
    query = 'SELECT proposal.proposal_id, service.services_approved, proposal.tic_ric_assign_v2, funding.funding \
        FROM proposal \
        INNER JOIN service ON proposal.proposal_id=service.proposal_id \
        INNER JOIN funding ON funding.proposal_id=service.proposal_id \
        WHERE proposal.gsu_com_2=‘1‘ \
        ORDER BY proposal.tic_ric_assign_v2;'
    run_query(req, res, query)
})
// // 
// // By Therapeutic Area
// // 
router.get('/approved-for-consultation/by-therapeutic-area', (req, res) => {
    query = 'SELECT proposal.proposal_id, service.services_approved, study.therapeutic_area, funding.funding \
        FROM proposal \
        INNER JOIN service ON proposal.proposal_id=service.proposal_id \
        INNER JOIN study ON service.proposal_id=study.proposal_id \
        INNER JOIN funding ON funding.proposal_id=study.proposal_id \
        WHERE proposal.gsu_com_2=‘1‘ \
        ORDER BY study.therapeutic_area;'
    run_query(req, res, query)
})
// // 
// // Resubmissions
// // 
router.get('/approved-for-consultation/resubmissions', (req, res) => {
    query = 'SELECT proposal.proposal_id, service.services_approved, funding.funding \
        FROM proposal \
        INNER JOIN service ON proposal.proposal_id=service.proposal_id \
        INNER JOIN funding ON funding.proposal_id=service.proposal_id \
        WHERE proposal.gen_status_complete=‘5‘;'
    run_query(req, res, query)
})

const run_query = (req, res, query) => {
    db.any(query)
        .then(data => {
            console.log(`HIT: ${req.path}`)
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
        })
}

module.exports = router