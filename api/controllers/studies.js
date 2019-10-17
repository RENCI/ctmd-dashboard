const db = require('../config/database')
const stringToInteger = require('./utils').stringToInteger
const fs = require('fs')
const csv = require('csv-parser')
const lookupFieldName = require('../config/dictionary')

exports.getProfile = (req, res) => {
    const proposalId = req.params.id
    const query = `SELECT * FROM "StudyProfile" WHERE "ProposalID" = ${ proposalId };`
    db.any(query)
        .then(data => {
            const profile = data[0]
            Object.keys(profile).forEach(key => {
                profile[key] = {
                    value: profile[key],
                    displayName: lookupFieldName(key),
                }
            })
            res.status(200).send(profile)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

exports.getSites = (req, res) => {
    const proposalId = req.params.id
    const query = `SELECT
            "StudySites"."ProposalID",
            "StudySites"."siteId",
            "StudySites"."ctsaId",
            "Sites"."siteId",
            "Sites"."siteName",
            "CTSAs"."ctsaId",
            "CTSAs"."ctsaName",
            "StudySites"."principalInvestigator",
            "StudySites"."dateRegPacketSent",
            "StudySites"."dateContractSent",
            "StudySites"."dateIrbSubmission",
            "StudySites"."dateIrbApproval",
            "StudySites"."dateContractExecution",
            "StudySites"."lpfv",
            "StudySites"."dateSiteActivated",
            "StudySites"."fpfv",
            "StudySites"."patientsConsentedCount",
            "StudySites"."patientsEnrolledCount",
            "StudySites"."patientsWithdrawnCount",
            "StudySites"."patientsExpectedCount",
            "StudySites"."queriesCount",
            "StudySites"."protocolDeviationsCount"
        FROM "StudySites"
        LEFT JOIN "Sites" ON "StudySites"."siteId" = "Sites"."siteId"
        LEFT JOIN "CTSAs" ON "StudySites"."ctsaId" = "CTSAs"."ctsaId"
        WHERE "ProposalID"=${ proposalId };`
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

exports.getEnrollmentData = (req, res) => {
    const proposalId = req.params.id
    const query = `SELECT
            "ProposalID",
            "date",
            "revisedProjectedSites",
            "actualSites",
            "actualEnrollment"
        FROM "EnrollmentInformation" WHERE "ProposalID" = ${ proposalId };`
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}