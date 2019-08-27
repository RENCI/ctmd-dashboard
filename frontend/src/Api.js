const apiRoot = (process.env.NODE_ENV === 'production') ? process.env.REACT_APP_API_ROOT : 'http://localhost:3030/'
const pipelineApiRoot = (process.env.NODE_ENV === 'production') ? process.env.REACT_APP_DATA_API_ROOT : 'http://localhost:5000/'

// Proposals

let endpoints = {
    proposals: apiRoot + 'proposals',
    oneProposal: id => apiRoot + `proposals/${ id }`,
    proposalsByTic: apiRoot + 'proposals/by-tic',
    proposalsByDate: apiRoot + 'proposals/by-date',
    proposalsByStatus: apiRoot + 'proposals/by-status',
    proposalsByOrganization: apiRoot + 'proposals/by-organization',
    proposalsByTherapeuticArea: apiRoot + 'proposals/by-therapeutic-area',
    overall: apiRoot + 'proposals/submitted-for-services/count',
    // network: apiRoot + 'proposals/network',
}

// Counts

endpoints = {
    ...endpoints,
    countByInstitution: apiRoot + 'proposals/submitted-for-services/count/by-institution',
    countByTic: apiRoot + 'proposals/submitted-for-services/count/by-tic',
    countByTherapeuticArea: apiRoot + 'proposals/submitted-for-services/count/by-therapeutic-area',
    countByYear: apiRoot + 'proposals/submitted-for-services/count/by-year',
    countByMonth: apiRoot + 'proposals/submitted-for-services/count/by-month',
}

// Resubmissions

endpoints = {
    ...endpoints,
    resubmissions: apiRoot + 'proposals/resubmissions',
    resubmissionsCount: apiRoot + 'proposals/resubmissions/count',
    resubmissionsCountByInstitution: apiRoot + 'proposals/resubmissions/count/by-institution',
    resubmissionsCountByTic: apiRoot + 'proposals/resubmissions/count/by-tic',
    resubmissionsCountByTherapeuticArea: apiRoot + 'proposals/resubmissions/count/by-therapeutic-area',
}

// 

endpoints = {
    ...endpoints,
    statuses: apiRoot + 'statuses',
    organizations: apiRoot + 'organizations',
    tics: apiRoot + 'tics',
    therapeuticAreas: apiRoot + 'therapeutic-areas',
    services: apiRoot + 'services',
    sites: apiRoot + 'sites',
    ctsas: apiRoot + 'ctsas',
    studyMetrics: apiRoot + 'study-metrics',
    siteMetrics: studyName => apiRoot + `site-metrics/retrieve/${ studyName }`,
    siteMetricsTemplateDownload: apiRoot + `site-metrics/template`,
    saveSiteReport: apiRoot + 'sites/reports',
}

// Studies, Sites, & CTSAs

endpoints = {
    ...endpoints,
    studyProfile: proposalID => apiRoot + `studies/${ proposalID }`, // GET - send json file containing study profile
    studySites: proposalID => apiRoot + `studies/${ proposalID }/sites`, // GET - send json file containing study sites
    studyEnrollmentData: proposalID => apiRoot + `studies/${ proposalID }/enrollment-data`, // GET - send json file containing study enrollment data
    studyUploadProfile: proposalID => apiRoot + `studies/${ proposalID }`, // POST - to send json file containing study profile
    studyUploadSites: proposalID => apiRoot + `studies/${ proposalID }/sites`, // POST - to send json file containing study sites
    studyUploadEnrollmentData: proposalID => apiRoot + `studies/${ proposalID }/enrollment-data`, // POST - to send json file containing study enrollment data
    // sitesUpload: apiRoot + `sites`, // POST to send json file containing site metrics for a study (indicated in file)
    ctsasUpload: apiRoot + `ctsas`, // POST to send json file containing CTSAs
}

// Pipeline

endpoints = {
    ...endpoints,
    dataGetBackups: pipelineApiRoot + 'data/backup', // GET to return list of available backups
    dataPostBackup: pipelineApiRoot + 'data/backup', // POST to back up database
    dataRestore: pipelineApiRoot + 'data/restore', // /data/restore/<timestamp> to restore to backup given in
    dataSync: pipelineApiRoot + 'data/sync', // POST to sync with redcap
    uploadSites: pipelineApiRoot + `table/Sites`,
    uploadCtsas: pipelineApiRoot + `table/CTSAs`,
    uploadStudyProfile: pipelineApiRoot + `table/StudyProfile`,
    uploadEnrollmentData: pipelineApiRoot + `table/EnrollmentData`,
}

export default endpoints