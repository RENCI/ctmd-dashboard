const express = require('express')
const router = express.Router()
const controller = require('../controllers/QueryController')
const proposalsController = require('../controllers/Proposals')

// Routes beginning with "HOSTNAME/proposals/..."

router.route('/approved').get(proposalsController.approvedProposals)
router.route('/submitted').get(proposalsController.submittedProposals)
router.route('/network').get(proposalsController.proposalsNetwork)
router.route('/by-stage').get(proposalsController.byStage)

// // // // // // // // // // // // // // // // // // // // // //
// // // Approved by the PAT for a <service – i.e. CIRB> // // //
// // // // // // // // // // // // // // // // // // // // // //

// // 
// // By Fiscal Year (July 1, 2016 – June 30, 2017 (Year1), July 1, 2017 – June 30, 2018 (Year2) . . . )
// // 

// For services approved in first meeting
router.get('/approved/first-meeting/by-year', (req, res) => {
    query = `SELECT DISTINCT service.proposal_id, service.services_approved, vote.meeting_date, funding.funding FROM service
        INNER JOIN vote ON service.proposal_id=vote.proposal_id
        INNER JOIN funding ON funding.proposal_id=vote.proposal_id
        WHERE vote.meeting_date is not NULL
        ORDER BY vote.meeting_date;`
    controller.runQuery(req, res, query)
})

// For services approved in second meeting:
router.get('/approved/second-meeting/by-year', (req, res) => {
    query = `SELECT DISTINCT service.proposal_id, service.services_approved, vote.meeting_date_2, funding.funding \
    FROM service INNER JOIN vote ON service.proposal_id=vote.proposal_id \
    INNER JOIN funding ON funding.proposal_id=vote.proposal_id \
    WHERE vote.meeting_date_2 is not NULL \
    ORDER BY vote.meeting_date_2;`
    controller.runQuery(req, res, query)
})

// // 
// // By Month
// // 

// For services approved in first meeting:
router.get('/approved/first-meeting/by-month', (req, res) => {
    query = `SELECT service.proposal_id, service.services_approved, vote.meeting_date,
        EXTRACT (YEAR FROM vote.meeting_date) as year,
        EXTRACT(MONTH FROM vote.meeting_date) as month, funding.funding
        FROM service
        INNER JOIN vote on service.proposal_id = vote.proposal_id
        INNER JOIN funding ON funding.proposal_id=vote.proposal_id
        WHERE vote.meeting_date is not NULL ORDER BY year, month;`
    controller.runQuery(req, res, query)
})
// For services approved in second meeting:
router.get('/approved/second-meeting/by-month', (req, res) => {
    query = `SELECT service.proposal_id, service.services_approved, vote.meeting_date_2,
        EXTRACT (YEAR FROM vote.meeting_date_2) as year,
        EXTRACT(MONTH FROM vote.meeting_date_2) as month, funding.funding
        FROM service
        INNER JOIN vote on service.proposal_id = vote.proposal_id
        INNER JOIN funding ON funding.proposal_id=vote.proposal_id
        WHERE vote.meeting_date_2 is not NULL ORDER BY year, month;`
    controller.runQuery(req, res, query)
})

// // 
// // By Institution Submitted
// // 

router.get('/approved/by-submitting-institution', (req, res) => {
    query = `SELECT DISTINCT proposal.proposal_id, service.services_approved, proposal.org_name, funding.funding
        FROM proposal
        INNER JOIN service ON proposal.proposal_id=service.proposal_id
        INNER JOIN funding ON funding.proposal_id=service.proposal_id ORDER BY proposal.org_name;`
    controller.runQuery(req, res, query)
})

// // 
// // By Institution assigned to (i.e. which TIC/RIC)
// // 

router.get('/approved/by-assigned-institution', (req, res) => {
    query = `SELECT proposal.proposal_id, service.services_approved, proposal.tic_ric_assign_v2, funding.funding
        FROM proposal
        INNER JOIN service ON proposal.proposal_id=service.proposal_id
        INNER JOIN funding ON funding.proposal_id=service.proposal_id
        ORDER BY proposal.tic_ric_assign_v2;`
    controller.runQuery(req, res, query)
})

// // 
// // By Therapeutic Area
// // 

router.get('/approved/by-therapeutic-area', (req, res) => {
    query = `SELECT DISTINCT service.proposal_id, service.services_approved, study.theraputic_area, funding.funding
        FROM service
        INNER JOIN study ON service.proposal_id=study.proposal_id
        INNER JOIN funding ON funding.proposal_id=study.proposal_id
        ORDER BY study.theraputic_area;`
    controller.runQuery(req, res, query)
})

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
// Submitted for a <service – i.e. CIRB – for ‘other’ should be noted combined as well as each item separate if possible’> //
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

// // 
// // By Fiscal Year (July 1, 2016 – June 30, 2017 (Year1), July 1, 2017 – June 30, 2018 (Year2) . . . )
// // 
router.get('/submitted/by-year', (req, res) => {
    query = `SELECT proposal.proposal_id, proposal.new_service_selection, proposal.planned_submission_date, funding.funding
        FROM proposal
        INNER JOIN funding on proposal.proposal_id = funding.proposal_id
        ORDER BY proposal.planned_submission_date ;`
    controller.runQuery(req, res, query)
})
// // 
// // By Month
// // 
router.get('/submitted/by-month', (req, res) => {
    query = `SELECT proposal.proposal_id, proposal.new_service_selection,proposal.planned_submission_date,
        EXTRACT (YEAR FROM proposal.planned_submission_date) as YEAR,
        EXTRACT(MONTH FROM proposal.planned_submission_date) as month, funding.funding
        FROM proposal
        INNER JOIN funding on proposal.proposal_id = funding.proposal_id
        ORDER BY YEAR, MONTH;`
    controller.runQuery(req, res, query)
})
// // 
// // By Institution submitted
// // 
router.get('/submitted/by-submitting-institution', (req, res) => {
    query = `SELECT DISTINCT proposal.proposal_id, proposal.new_service_selection, proposal.org_name, funding.funding
        FROM proposal
        INNER JOIN funding ON proposal.proposal_id=funding.proposal_id
        ORDER BY proposal.org_name;`
    controller.runQuery(req, res, query)
})
// // 
// // By Institution assigned to (i.e. which TIC/RIC)
// // 
router.get('/submitted/by-assigned-institution', (req, res) => {
    query = `SELECT DISTINCT proposal.proposal_id,proposal.new_service_selection, proposal.tic_ric_assign_v2, funding.funding
        FROM proposal
        INNER JOIN funding ON proposal.proposal_id=funding.proposal_id
        ORDER BY proposal.tic_ric_assign_v2;`
    controller.runQuery(req, res, query)
})
// // 
// // By Therapeutic Area
// // 
router.get('/submitted/by-therapeutic-area', (req, res) => {
    query = `SELECT DISTINCT proposal.proposal_id,proposal.new_service_selection, study.theraputic_area, funding.funding
        FROM proposal
        INNER JOIN study ON proposal.proposal_id=study.proposal_id
        INNER JOIN funding ON funding.proposal_id=study.proposal_id ORDER BY study.theraputic_area;`
    controller.runQuery(req, res, query)
})

// // // // // // // // // // // // // // // // // //
// Approved by PAT for Comprehensive Consultation  //
// // // // // // // // // // // // // // // // // //

// // 
// // Overall
// // 
router.get('/approved-for-consultation', (req, res) => {
    query = ``
    controller.runQuery(req, res, query)
})
// // 
// // By Fiscal Year (July 1, 2016 – June 30, 2017 (Year1), July 1, 2017 – June 30, 2018 (Year2) . . . )
// // 
router.get('/approved-for-consultation/by-year', (req, res) => {
    query = `SELECT proposal.proposal_id, service.services_approved, proposal.year_icc, funding.funding
        FROM proposal
        INNER JOIN service ON proposal.proposal_id=service.proposal_id
        INNER JOIN funding ON funding.proposal_id=service.proposal_id
        WHERE proposal.gsu_com_2='1'
        ORDER BY proposal.year_icc;`
    controller.runQuery(req, res, query)
})
// // 
// // By Month
// // 
router.get('/approved-for-consultation/by-month', (req, res) => {
    query = `SELECT proposal.proposal_id, service.services_approved, proposal.month_icc, funding.funding
        FROM proposal
        INNER JOIN service ON proposal.proposal_id=service.proposal_id
        INNER JOIN funding ON funding.proposal_id=service.proposal_id
        WHERE proposal.gsu_com_2='1'
        ORDER BY proposal.month_icc;`
    controller.runQuery(req, res, query)
})
// // 
// // By Institution submitted
// // 
router.get('/approved-for-consultation/by-submitting-institution', (req, res) => {
    query = `SELECT DISTINCT proposal.proposal_id, service.services_approved, proposal.org_name, funding.funding
        FROM proposal
        INNER JOIN service ON proposal.proposal_id=service.proposal_id
        INNER JOIN funding ON funding.proposal_id=service.proposal_id
        WHERE proposal.gsu_com_2='1'
        ORDER BY proposal.org_name;`
    controller.runQuery(req, res, query)
})
// // 
// // By Institution assigned to (i.e. which TIC/RIC)
// // 
router.get('/approved-for-consultation/by-assigned-institution', (req, res) => {
    query = `SELECT proposal.proposal_id, service.services_approved, proposal.tic_ric_assign_v2, funding.funding
        FROM proposal
        INNER JOIN service ON proposal.proposal_id=service.proposal_id
        INNER JOIN funding ON funding.proposal_id=service.proposal_id
        WHERE proposal.gsu_com_2='1'
        ORDER BY proposal.tic_ric_assign_v2;`
    controller.runQuery(req, res, query)
})
// // 
// // By Therapeutic Area
// // 
router.get('/approved-for-consultation/by-therapeutic-area', (req, res) => {
    query = `SELECT proposal.proposal_id, service.services_approved, study.theraputic_area, funding.funding
        FROM proposal
        INNER JOIN service ON proposal.proposal_id=service.proposal_id
        INNER JOIN study ON service.proposal_id=study.proposal_id
        INNER JOIN funding ON funding.proposal_id=study.proposal_id
        WHERE proposal.gsu_com_2='1'
        ORDER BY study.theraputic_area;`
    controller.runQuery(req, res, query)
})
// // 
// // Resubmissions
// // 
router.get('/approved-for-consultation/resubmissions', (req, res) => {
    query = `SELECT proposal.proposal_id, service.services_approved, funding.funding
        FROM proposal
        INNER JOIN service ON proposal.proposal_id=service.proposal_id
        INNER JOIN funding ON funding.proposal_id=service.proposal_id
        WHERE proposal.gen_status_complete='5';`
    controller.runQuery(req, res, query)
})

module.exports = router