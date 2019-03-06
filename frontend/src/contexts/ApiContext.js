import React from 'react'

export const ApiContext = React.createContext({})

const apiRoot = (process.env.NODE_ENV === 'production') ? 'http://localhost/api/' : 'http://localhost:3030/'
export const endpoints = {
    proposals: apiRoot + 'proposals',
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
}

