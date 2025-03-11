const dictionary = {
    ProposalID: 'Proposal ID',
    network: 'Network',
    tic: 'TIC',
    ric: 'RIC',
    type: 'Type',
    linkedStudies: 'Has Linked Studies',
    design: 'Design',
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
    irbType: 'IRB Type',
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
    fundingSource: 'Source of Funding',
    fundingAwardDate: 'Date Funding was Awarded',
    isPreviouslyFunded: 'Was Previously Funded',
}

const lookupFieldName = fieldName => {
    if (fieldName.trim() === '') {
        return ''
    }
    if (dictionary.hasOwnProperty(fieldName)) {
        return dictionary[fieldName]
    } else {
        return fieldName
    }
}

module.exports = lookupFieldName
