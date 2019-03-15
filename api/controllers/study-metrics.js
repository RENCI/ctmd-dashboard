
const randomString = (length = 8) => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let returnString = [...Array(length).keys()].map(
        i => alphabet.charAt(Math.floor(Math.random() * alphabet.length))
    ).join('')
    return returnString
}

const sampleData = [...Array(3).keys()].map(i => (
    {
        id: randomString(6),
        network: 'cpccrn',
        tic: 'jhu-tufts-tic',
        studyAcronym: 'T.E.S.T.',
        studyFullName: 'The Extremely Super Test',
        primaryStudyType: 'clinical-trial',
        linkedData: Math.random() < 0.5,
        linkedStudy: 'WXYZ',
        isRandomized: '0',
        randomizationUnit: 'individual',
        randomizationFeatures: [ 'block-randomization', 'response-adaptive-randomization', 'covariate-adaptive-randomization' ],
        phase: 'phase-1',
        pilotOrDemo: '',
        isRegistry: '0',
        isEhrDataTransfer: Math.random() < 0.5,
        isConsentRequired: Math.random() < 0.5,
        efic: Math.random() < 0.5,
        irbTypes: [ 'central-irb', 'local-irb' ],
        regulatoryClassifications: [ 'requires-ide', 'requires-nsr', 'post-marketing-study' ],
        clinicalTrialsGovId: '98734oyuro84byo38wy',
        dsmbDmcRequired: Math.random() < 0.5,
        initialParticipatingSiteNumber: '53',
        enrollmentGoal: '300',
        initialProjectedEnrollmentDuration: '24',
        leadPiNames: Math.random() < 0.5 ? 'Jane Doe' : 'John Doe',
        awardeeSiteAcronym: 'DCC',
        primaryFundingType: 'government',
        primarilyFundedByInfrastructure: '0',
        fundingSource: 'NSF',
        fundingAwarded: '',
        previousFunding: Math.random() < 0.5,
        studyDesign: 'observational',
        isPilotOrDemo: Math.random() < 0.5,
        fundingAwardedDate: '03/15/2019'
    }
))

exports.list = (req, res) => {
    res.send(sampleData)
}

exports.post = (req, res) => {
    const newMetric = { id: '76aXa333lklKJk9', ...req.body }
    console.log(newMetric)
    res.send('Success!')
}
