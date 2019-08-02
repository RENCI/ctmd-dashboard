const apiRoot = (process.env.NODE_ENV === 'production') ? process.env.REACT_APP_API_ROOT : 'http://localhost:3030/'
const dataApiRoot = (process.env.NODE_ENV === 'production') ? process.env.REACT_APP_API_ROOT : 'http://localhost:3000/data/'

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

endpoints = {
    ...endpoints,
    countByInstitution: apiRoot + 'proposals/submitted-for-services/count/by-institution',
    countByTic: apiRoot + 'proposals/submitted-for-services/count/by-tic',
    countByTherapeuticArea: apiRoot + 'proposals/submitted-for-services/count/by-therapeutic-area',
    countByYear: apiRoot + 'proposals/submitted-for-services/count/by-year',
    countByMonth: apiRoot + 'proposals/submitted-for-services/count/by-month',
}

endpoints = {
    ...endpoints,
    resubmissions: apiRoot + 'proposals/resubmissions',
    resubmissionsCount: apiRoot + 'proposals/resubmissions/count',
    resubmissionsCountByInstitution: apiRoot + 'proposals/resubmissions/count/by-institution',
    resubmissionsCountByTic: apiRoot + 'proposals/resubmissions/count/by-tic',
    resubmissionsCountByTherapeuticArea: apiRoot + 'proposals/resubmissions/count/by-therapeutic-area',
}

endpoints = {
    ...endpoints,
    statuses: apiRoot + 'statuses',
    organizations: apiRoot + 'organizations',
    tics: apiRoot + 'tics',
    therapeuticAreas: apiRoot + 'therapeutic-areas',
    services: apiRoot + 'services',
    // sites: apiRoot + 'sites',
    studyMetrics: apiRoot + 'study-metrics',
    siteMetrics: studyName => apiRoot + `site-metrics/retrieve/${ studyName }`,
    siteMetricsTemplateDownload: apiRoot + `site-metrics/template`,
    saveSiteReport: apiRoot + 'sites/reports',
}

endpoints = {
    ...endpoints,
    studyProfile: proposalId => apiRoot + `study-profile/${ proposalId }`, // GET study profile for a given proposal id
    studyProfileUpload: proposalID => apiRoot + `study-profile/${ proposalID }`, // POST to send json file containing study profile and sites
}

endpoints = {
    ...endpoints,
    dataGetBackups: dataApiRoot + 'backup', // GET to return list of available backups
    dataPostBackup: dataApiRoot + 'backup', // POST to back up database
    dataRestore: dataApiRoot + 'restore', // /data/restore/<timestamp> to restore to backup given in
    dataSync: dataApiRoot + 'sync', // POST to sync with redcap
}

export default endpoints