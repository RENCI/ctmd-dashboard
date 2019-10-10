const db = require('../config/database')
const stringToInteger = require('./utils').stringToInteger
const fs = require('fs')
const csv = require('csv-parser')

const profileKeyDisplayNames = {
    ProposalID: 'Proposal ID',
    network: 'Network',
    tic: 'TIC',
    ric: 'RIC',
    type: 'Type',
    design: 'Design',
    linkedStudies: 'Has Linked Studies',
    isRandomized: 'Study is Randomized',
    randomizationUnit: 'Randomization Unit',
    randomizationFeature: 'Randomization Feature',
    ascertainment: 'Ascertainment',
    observations: 'Observations',
    isPilot: 'Pilot Study',
    phase: 'Phase',
    isRegistry: 'Is Registry',
    ehrDataTransfer: 'EHR Data Transfer',
    ehrDatatransferOption: 'EHR Data Transfer Option',
    isConsentRequired: 'Study Requires Consent',
    isEfic: 'Is EFIC',
    irbType: 'ORB Type',
    regulatoryClassification: 'Regulatory Classification',
    clinicalTrialsGovId: 'ClinicalTrials.gov ID',
    isDsmbDmcRequired: 'DSMB/DMC Required',
    initialParticipatingSiteCount: 'Number of Initial Participating Sites',
    enrollmentGoal: 'Enrollment Goal',
    initialProjectedEnrollmentDuration: 'Initial Projects Enrollment Duration',
    leadPIs: 'Lead PIs',
    awardeeSiteAcronym: 'Awardee Site Acronym',
    primaryFundingType: 'Primary Funding Type',
    isFundedPrimarilyByInfrastructure: 'Funded Primarily by Infrastructure',
    isPreviouslyFunded: 'Was Previously Funded',
    fundingAwardDate: 'Date Funding was Awarded',
    fundingSource: 'Source of Funding',
}

const siteMetricsKeyDisplayNames = {
    ProposalID: 'Proposal ID',
    siteId: 'Site ID',
    siteName: 'Site Name',
    ctsaId: 'CTSA ID',
    ctsaName: 'CTSA Name',
    network: 'Network',
    tic: 'TIC',
    ric: 'RIC',
    type: 'Type',
    design: 'Design',
    principalInvestigator: 'PI',
    dateRegPacketSent: 'Date Final Protocol Sent to Site',
    dateContractSent: 'Date of Contract Execution',
    dateIrbSubmission: 'Date of IRB Submission',
    dateIrbApproval: 'Date of IRB Approval',
    dateContractExecution: 'Date of Contract Execution',
    dateSiteActivated: 'Date of Site Activation',
    fpfv: 'Date of First Participant (FPFV)',
    lpfv: 'Date of Last Participant (LPFV)',
    patientsConsentedCount: 'Number of Consented Patients',
    patientsEnrolledCount: 'Number of Randomized Patients',
    patientsExpectedCount: 'Number of Expected Randomized Patients',
    patientsWithdrawnCount: 'Number of Withdrawn Patients',
    queriesCount: 'Number of Queries',
    protocolDeviationsCount: 'Number of Major Protocol Deviations',
}

exports.getProfile = (req, res) => {
    const proposalId = req.params.id
    const query = `SELECT * FROM "StudyProfile" WHERE "ProposalID" = ${ proposalId };`
    db.any(query)
        .then(data => {
            const profile = data[0]
            Object.keys(profile).forEach(key => {
                profile[key] = {
                    value: profile[key],
                    displayName: profileKeyDisplayNames[key],
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