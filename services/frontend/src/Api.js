const apiRoot = '/api/'
const pipelineApiRoot = '/data/'

/*
    There are lots of endpoints we've created since development of this application began, and many are no longer used.
    I'm commenting out endpoints here that should be deprecated. Once confirmed they're no longer needed,
    let's clean this up and remove the corresponding routes and controllers from the API.
*/

// Proposals
let endpoints = {
  proposals: apiRoot + 'proposals',
  oneProposal: (id) => apiRoot + `proposals/${id}`,
  // proposalsByTic: apiRoot + 'proposals/by-tic',
  // proposalsByDate: apiRoot + 'proposals/by-date',
  // proposalsByStatus: apiRoot + 'proposals/by-status',
  // proposalsByOrganization: apiRoot + 'proposals/by-organization',
  // proposalsByTherapeuticArea: apiRoot + 'proposals/by-therapeutic-area',
  // overall: apiRoot + 'proposals/submitted-for-services/count',
  // network: apiRoot + 'proposals/network',
}

// Resubmissions

// endpoints = {
//     ...endpoints,
//     resubmissions: apiRoot + 'proposals/resubmissions',
//     resubmissionsCount: apiRoot + 'proposals/resubmissions/count',
//     resubmissionsCountByInstitution: apiRoot + 'proposals/resubmissions/count/by-institution',
//     resubmissionsCountByTic: apiRoot + 'proposals/resubmissions/count/by-tic',
//     resubmissionsCountByTherapeuticArea: apiRoot + 'proposals/resubmissions/count/by-therapeutic-area',
// }

//

endpoints = {
  ...endpoints,
  statuses: apiRoot + 'statuses',
  organizations: apiRoot + 'organizations',
  tics: apiRoot + 'tics',
  therapeuticAreas: apiRoot + 'therapeutic-areas',
  resources: apiRoot + 'resources',
  sites: apiRoot + 'sites',
  ctsas: apiRoot + 'ctsas',
  // studyMetrics: apiRoot + 'study-metrics',
  // siteMetrics: studyName => apiRoot + `site-metrics/retrieve/${ studyName }`,
  // siteMetricsTemplateDownload: apiRoot + `site-metrics/template`,
  // saveSiteReport: apiRoot + 'sites/reports',
}

// Studies, Sites, & CTSAs

endpoints = {
  ...endpoints,
  studyProfile: (proposalID) => apiRoot + `studies/${proposalID}`, // GET - send json file containing study profile
  studySites: () => apiRoot + `studies/studysites`, // GET - send json file containing study sites
  studySitesByProposalId: (proposalID) => apiRoot + `studies/${proposalID}/sites`, // GET - send json file containing study sites
  studyEnrollmentData: (proposalID) => apiRoot + `studies/${proposalID}/enrollment-data`, // GET - send json file containing study enrollment data
  // studyUploadProfile: proposalID => apiRoot + `studies/${ proposalID }`, // POST - to send json file containing study profile
  // studyUploadSites: proposalID => apiRoot + `studies/${ proposalID }/sites`, // POST - to send json file containing study sites
  // studyUploadEnrollmentData: proposalID => apiRoot + `studies/${ proposalID }/enrollment-data`, // POST - to send json file containing study enrollment data
  // sitesUpload: apiRoot + `sites`, // POST to send json file containing site metrics for a study (indicated in file)
  // ctsasUpload: apiRoot + `ctsas`, // POST to send json file containing CTSAs
  authStatus: apiRoot + 'auth_status',
  isHealUser: apiRoot + 'is_heal_user',
}

// Pipeline

endpoints = {
  ...endpoints,
  dataGetBackups: pipelineApiRoot + 'backup', // GET to return list of available backups
  dataPostBackup: pipelineApiRoot + 'backup', // POST to back up database
  dataRestore: (timestamp) => `${pipelineApiRoot}restore/${timestamp}`, // /data/restore/<timestamp> to restore to backup given in
  dataSync: pipelineApiRoot + 'sync', // POST to sync with redcap
  dataGetTasks: pipelineApiRoot + 'task',
  dataGetTask: (jobId) => pipelineApiRoot + `task/${jobId}`,
  uploadSites: pipelineApiRoot + `table/Sites/column/siteId`,
  uploadCtsas: pipelineApiRoot + `table/CTSAs/column/ctsaId`,
  uploadStudyProfile: pipelineApiRoot + `table/StudyProfile/column/ProposalID`,
  uploadStudySites: pipelineApiRoot + `table/StudySites/column/siteId`,
  uploadStudyEnrollmentData: pipelineApiRoot + `table/EnrollmentInformation/column/ProposalID`,
  logout: apiRoot + 'logout',
}

// Template Downloads
endpoints = {
  ...endpoints,
  download: (tableName) => apiRoot + `template/${tableName}`, // GET to download template
}

export default endpoints
