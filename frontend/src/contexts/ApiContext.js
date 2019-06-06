import React from 'react'

export const ApiContext = React.createContext({})

const apiRoot = (process.env.NODE_ENV === 'production') ? process.env.REACT_APP_API_ROOT : 'http://localhost:3030/'
const dataApiRoot = (process.env.NODE_ENV === 'production') ? process.env.REACT_APP_API_ROOT : 'http://localhost:3000/data/'

export const endpoints = {
    proposals: apiRoot + 'proposals',
    oneProposal: id => apiRoot + `proposals/${ id }`,
    proposalsByTic: apiRoot + 'proposals/by-tic',
    proposalsByDate: apiRoot + 'proposals/by-date',
    proposalsByStatus: apiRoot + 'proposals/by-status',
    proposalsByOrganization: apiRoot + 'proposals/by-organization',
    proposalsByTherapeuticArea: apiRoot + 'proposals/by-therapeutic-area',
    overall: apiRoot + 'proposals/submitted-for-services/count',
    countByInstitution: apiRoot + 'proposals/submitted-for-services/count/by-institution',
    countByTic: apiRoot + 'proposals/submitted-for-services/count/by-tic',
    countByTherapeuticArea: apiRoot + 'proposals/submitted-for-services/count/by-therapeutic-area',
    countByYear: apiRoot + 'proposals/submitted-for-services/count/by-year',
    countByMonth: apiRoot + 'proposals/submitted-for-services/count/by-month',
    resubmissions: apiRoot + 'proposals/resubmissions',
    resubmissionsCount: apiRoot + 'proposals/resubmissions/count',
    resubmissionsCountByInstitution: apiRoot + 'proposals/resubmissions/count/by-institution',
    resubmissionsCountByTic: apiRoot + 'proposals/resubmissions/count/by-tic',
    resubmissionsCountByTherapeuticArea: apiRoot + 'proposals/resubmissions/count/by-therapeutic-area',
    network: apiRoot + 'proposals/network',
    statuses: apiRoot + 'statuses',
    organizations: apiRoot + 'organizations',
    tics: apiRoot + 'tics',
    therapeuticAreas: apiRoot + 'therapeutic-areas',
    services: apiRoot + 'services',
    studyMetrics: apiRoot + 'study-metrics',
    sites: apiRoot + 'sites',
    saveSiteReport: apiRoot + 'sites/reports',
    dataGetBackups: dataApiRoot + 'backup', // GET to return list of available backups
    dataPostBackup: dataApiRoot + 'backup', // POST to back up database
    dataRestore: dataApiRoot + 'restore', // /data/restore/<timestamp> to restore to backup given in
    dataSync: dataApiRoot + 'sync', // POST to sync with redcap
}
