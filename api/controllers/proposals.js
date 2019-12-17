const db = require('../config/database')

// /proposals/:id(\\d+)
exports.getOne = (req, res) => {
    const query = `SELECT CAST("Proposal"."ProposalID" AS INT) as "proposalID",
            "Proposal"."ShortTitle" as "shortTitle",
            "Proposal"."FullTitle" as "longTitle",
            "Proposal"."ShortDescription" AS "shortDescription",
            CAST("Proposal"."dateSubmitted" AS VARCHAR),
            TRIM(CONCAT("Submitter"."submitterFirstName", ' ', "Submitter"."submitterLastName")) AS "piName",
            name.description AS "proposalStatus",
            name2.description AS "assignToInstitution",
            name3.description AS "submitterInstitution",
            name4.description AS "therapeuticArea",
            name5.description AS "fundingStatus",
            name6.description AS "fundingStatusWhenApproved",
            name7.description AS "studyPopulation",
            name8.description AS "phase",
            "ProposalFunding"."amountAward" AS "fundingAmount",
            CAST("ProposalFunding"."fundingPeriod" AS VARCHAR),
            CAST("ProposalFunding"."fundingStart" AS VARCHAR),
            CAST("PATMeeting"."meetingDate" AS VARCHAR),
            CAST("ProtocolTimelines_estimated"."estimatedStartDateOfFunding" AS VARCHAR) AS "estimatedFundingStartDate",
            CAST("ProtocolTimelines_estimated"."plannedGrantSubmissionDate" AS VARCHAR)
        FROM "Proposal" 
        INNER JOIN "Submitter" ON "Proposal"."ProposalID" = "Submitter"."ProposalID"
        INNER JOIN "ProposalDetails" ON "Proposal"."ProposalID" = "ProposalDetails"."ProposalID"
        LEFT JOIN "AssignProposal" ON "Proposal"."ProposalID" = "AssignProposal"."ProposalID"
        INNER JOIN "ProposalFunding" ON "Proposal"."ProposalID" = "ProposalFunding"."ProposalID"
        LEFT JOIN "PATMeeting" ON "Proposal"."ProposalID" = "PATMeeting"."ProposalID"
        LEFT JOIN "ProtocolTimelines_estimated" ON "Proposal"."ProposalID" = "ProtocolTimelines_estimated"."ProposalID"
        INNER JOIN name ON name.index = "Proposal"."proposalStatus" AND name."column" = 'proposalStatus'
        LEFT JOIN name name2 ON name2.index = "AssignProposal"."assignToInstitution" AND name2."column" = 'assignToInstitution'
        LEFT JOIN name name3 ON name3.index = "Submitter"."submitterInstitution" AND name3."column" = 'submitterInstitution'
        INNER JOIN name name4 ON name4.index = "ProposalDetails"."therapeuticArea" AND name4."column" = 'therapeuticArea'
        LEFT JOIN name name5 ON name5.index = "ProposalFunding"."currentFunding" AND name5."column" = 'currentFunding'
        LEFT JOIN name name6 ON name6.index = "ProposalFunding"."newFundingStatus" AND name6."column" = 'newFundingStatus'
        LEFT JOIN name name7 ON name7.index = "Proposal"."StudyPopulation" AND name7."column" = 'StudyPopulation'
        LEFT JOIN name name8 ON name8.index = "Proposal"."PhaseOfStudy" AND name8."column" = 'PhaseOfStudy'
        WHERE "Proposal"."ProposalID"=${ req.params.id }`
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

const proposalsQuery = `SELECT CAST("Proposal"."ProposalID" AS INT) as "proposalID",
            "Proposal"."ShortTitle" as "shortTitle",
            "Proposal"."FullTitle" as "longTitle",
            "Proposal"."ShortDescription" AS "shortDescription",
            CAST("Proposal"."dateSubmitted" AS VARCHAR),
            TRIM(CONCAT("Submitter"."submitterFirstName", ' ', "Submitter"."submitterLastName")) AS "piName",
            name.description AS "proposalStatus",
            name2.description AS "assignToInstitution",
            name3.description AS "submitterInstitution",
            name4.description AS "therapeuticArea",
            name5.description AS "fundingStatus",
            name6.description AS "fundingStatusWhenApproved",
            name7.description AS "studyPopulation",
            name8.description AS "phase",
            "ProposalFunding"."amountAward" AS "fundingAmount",
            CAST("ProposalFunding"."fundingPeriod" AS VARCHAR),
            CAST("ProposalFunding"."fundingStart" AS VARCHAR) AS "actualFundingStartDate",
            CAST("PATMeeting"."meetingDate" AS VARCHAR),
            CAST("ProtocolTimelines_estimated"."estimatedStartDateOfFunding" AS VARCHAR) AS "estimatedFundingStartDate",
            CAST("ProtocolTimelines_estimated"."plannedGrantSubmissionDate" AS VARCHAR),
            CAST("ProtocolTimelines_estimated"."actualGrantSubmissionDate" AS VARCHAR)
        FROM "Proposal"
        INNER JOIN "Submitter" ON "Proposal"."ProposalID" = "Submitter"."ProposalID"
        INNER JOIN "ProposalDetails" ON "Proposal"."ProposalID" = "ProposalDetails"."ProposalID"
        LEFT JOIN "AssignProposal" ON "Proposal"."ProposalID" = "AssignProposal"."ProposalID"
        INNER JOIN "ProposalFunding" ON "Proposal"."ProposalID" = "ProposalFunding"."ProposalID"
        LEFT JOIN "PATMeeting" ON "Proposal"."ProposalID" = "PATMeeting"."ProposalID"
        LEFT JOIN "ProtocolTimelines_estimated" ON "Proposal"."ProposalID" = "ProtocolTimelines_estimated"."ProposalID"
        INNER JOIN name ON name.index = "Proposal"."proposalStatus" AND name."column" = 'proposalStatus'
        LEFT JOIN name name2 ON name2.index = "AssignProposal"."assignToInstitution" AND name2."column" = 'assignToInstitution'
        LEFT JOIN name name3 ON name3.index = "Submitter"."submitterInstitution" AND name3."column" = 'submitterInstitution'
        INNER JOIN name name4 ON name4.index = "ProposalDetails"."therapeuticArea" AND name4."column" = 'therapeuticArea'
        LEFT JOIN name name5 ON name5.index = "ProposalFunding"."currentFunding" AND name5."column" = 'currentFunding'
        LEFT JOIN name name6 ON name6.index = "ProposalFunding"."newFundingStatus" AND name6."column" = 'newFundingStatus'
        LEFT JOIN name name7 ON name7.index = "Proposal"."StudyPopulation" AND name7."column" = 'StudyPopulation'
        LEFT JOIN name name8 ON name8.index = "Proposal"."PhaseOfStudy" AND name8."column" = 'PhaseOfStudy'
        ORDER BY "proposalID";`

const query2 = `SELECT "Proposal"."ProposalID" as "proposalID",                  
                        "Proposal"."ShortTitle" as "shortTitle",
                        "Proposal"."dateSubmitted",                                                                                                      
                        TRIM(CONCAT("Submitter"."submitterFirstName", ' ', "Submitter"."submitterLastName")) AS "piName",
                        name.description AS "proposalStatus",
                        name2.description AS "assignToInstitution",
                        name3.description AS "submitterInstitution",
                        name4.description AS "therapeuticArea",
                        name5.description AS "newServiceSelection",
                        "ProposalFunding"."totalBudget",
                        "ProposalFunding"."fundingPeriod",
                        "ProposalFunding"."fundingStart",
                        "PATMeeting"."meetingDate",
                        "ProtocolTimelines_estimated"."plannedGrantSubmissionDate",
                        "ProtocolTimelines_estimated"."actualGrantSubmissionDate"
                    FROM "Proposal"
                    INNER JOIN "Submitter" ON "Proposal"."ProposalID" = "Submitter"."ProposalID"
                    INNER JOIN "ProposalDetails" ON "Proposal"."ProposalID" = "ProposalDetails"."ProposalID"
                    LEFT JOIN "AssignProposal" ON "Proposal"."ProposalID" = "AssignProposal"."ProposalID"
                    INNER JOIN "ProposalFunding" ON "Proposal"."ProposalID" = "ProposalFunding"."ProposalID"
                    LEFT JOIN "PATMeeting" ON "Proposal"."ProposalID" = "PATMeeting"."ProposalID"
                    LEFT JOIN "ProtocolTimelines_estimated" ON "Proposal"."ProposalID" = "ProtocolTimelines_estimated"."ProposalID"
                    INNER JOIN "Proposal_NewServiceSelection" ON "Proposal"."ProposalID" = "Proposal_NewServiceSelection"."ProposalID"
                    INNER JOIN name ON name.index="Proposal"."proposalStatus" AND name."column"='proposalStatus'
                    LEFT JOIN name name2 ON name2.index="AssignProposal"."assignToInstitution" AND name2."column"='assignToInstitution'
                    LEFT JOIN name name3 ON name3.index="Submitter"."submitterInstitution" AND name3."column"='submitterInstitution'
                    INNER JOIN name name4 ON name4.index="ProposalDetails"."therapeuticArea" AND name4."column"='therapeuticArea'
                    INNER JOIN name name5 ON name5.id="Proposal_NewServiceSelection"."serviceSelection" AND name5."column"='serviceSelection'
                    ORDER BY "proposalID";`

const query3 = `SELECT "Proposal"."ProposalID" as "proposalID",                  
                        "Proposal"."ShortTitle" as "shortTitle",
                        "Proposal"."dateSubmitted",                                                                                                      
                        TRIM(CONCAT("Submitter"."submitterFirstName", ' ', "Submitter"."submitterLastName")) AS "piName",
                        name.description AS "proposalStatus",
                        name2.description AS "assignToInstitution",
                        name3.description AS "submitterInstitution",
                        name4.description AS "therapeuticArea",
                        name5.description AS "servicesApproved",
                        "ProposalFunding"."totalBudget",
                        "ProposalFunding"."fundingPeriod",
                        "ProposalFunding"."fundingStart",
                        "PATMeeting"."meetingDate",
                        "ProtocolTimelines_estimated"."plannedGrantSubmissionDate",
                        "ProtocolTimelines_estimated"."actualGrantSubmissionDate"
                    FROM "Proposal"
                    INNER JOIN "Submitter" ON "Proposal"."ProposalID"="Submitter"."ProposalID"
                    INNER JOIN "ProposalDetails" ON "Proposal"."ProposalID"="ProposalDetails"."ProposalID"
                    LEFT JOIN "AssignProposal" ON "Proposal"."ProposalID"="AssignProposal"."ProposalID"
                    INNER JOIN "ProposalFunding" ON "Proposal"."ProposalID" = "ProposalFunding"."ProposalID"
                    LEFT JOIN "PATMeeting" ON "Proposal"."ProposalID" = "PATMeeting"."ProposalID"
                    LEFT JOIN "ProtocolTimelines_estimated" ON "Proposal"."ProposalID" = "ProtocolTimelines_estimated"."ProposalID"
                    INNER JOIN "Proposal_ServicesApproved" ON "Proposal"."ProposalID" = "Proposal_ServicesApproved"."ProposalID"
                    INNER JOIN name ON name.index="Proposal"."proposalStatus" AND name."column"='proposalStatus'
                    LEFT JOIN name name2 ON name2.index="AssignProposal"."assignToInstitution" AND name2."column"='assignToInstitution'
                    LEFT JOIN name name3 ON name3.index="Submitter"."submitterInstitution" AND name3."column"='submitterInstitution'
                    INNER JOIN name name4 ON name4.index="ProposalDetails"."therapeuticArea" AND name4."column"='therapeuticArea'
                    INNER JOIN name name5 ON name5.id="Proposal_ServicesApproved"."servicesApproved" AND name5."column"='servicesApproved'
                    ORDER BY "proposalID";`

const approvedServicesQuery =
    `SELECT CAST("Proposal"."ProposalID" AS INT) as "proposalID", name.description AS service
        FROM "Proposal"
        INNER JOIN "Proposal_ServicesApproved" ON "Proposal"."ProposalID" = "Proposal_ServicesApproved"."ProposalID"
        INNER JOIN name ON name.id="Proposal_ServicesApproved"."servicesApproved" AND name."column"='servicesApproved'
        ORDER BY name.description;`

const requestedServicesQuery =
    `SELECT CAST("Proposal"."ProposalID" AS INT) as "proposalID", name.description AS service
        FROM "Proposal"
        INNER JOIN "Proposal_NewServiceSelection" ON "Proposal"."ProposalID" = "Proposal_NewServiceSelection"."ProposalID"
        INNER JOIN name ON name.id="Proposal_NewServiceSelection"."serviceSelection" AND name."column"='serviceSelection'
        ORDER BY name.description;`

// /proposals
exports.list = (req, res) => {
    db.task(t => {
        return t.any(proposalsQuery)
            .then(data => {
                const proposals = data.map(prop => ({
                    ...prop,
                    profile: null,
                    requestedServices: [],
                    approvedServices: [],
                }))
                return t.any(`SELECT * FROM "StudyProfile";`)
                    .then(data => {
                        data.forEach(profile => {
                            const propIndex = proposals.findIndex(prop => prop.proposalID === +profile.ProposalID)
                            if (propIndex >= 0) proposals[propIndex].profile = profile
                        })
                        return t.any(requestedServicesQuery)
                            .then(data => {
                                data.forEach(prop_serv => {
                                    const propIndex = proposals.findIndex(prop => prop.proposalID === prop_serv.proposalID)
                                    if (propIndex >= 0) proposals[propIndex].requestedServices.push(prop_serv.service)
                                })
                                proposals.forEach(proposal => {
                                    proposal.approvedForComprehensiveConsultation = proposal.requestedServices.length === 0
                                })
                                return t.any(approvedServicesQuery)
                                    .then(data => {
                                        data.forEach(prop_serv => {
                                            const propIndex = proposals.findIndex(prop => prop.proposalID === prop_serv.proposalID)
                                            if (propIndex >= 0) proposals[propIndex].approvedServices.push(prop_serv.service)
                                        })
                                        return proposals
                                    })
                            })
                    })
            })
    })
        .then(proposals => res.status(200).send(proposals))
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/by-status
exports.byStatus = (req, res) => {
    let statusQuery = `SELECT description AS name FROM name WHERE "column"='proposalStatus' ORDER BY index;`
    db.any(statusQuery)
        .then(statuses => {
            statuses.forEach(status => { status.proposals = [] })
            db.any(proposalsQuery)
                .then(data => {
                    data.forEach(proposal => {
                        const index = statuses.findIndex(status => status.name === proposal.proposalStatus)
                        if (index >= 0) statuses[index].proposals.push(proposal)
                    })
                    res.status(200).send(statuses)
                })
                .catch(error => {
                    console.log('ERROR:', error)
                    res.status(500).send('There was an error fetching data.')
                })
        })
}

// /proposals/by-submitted-service
exports.bySubmittedService = (req, res) => {
    let serviceQuery = `SELECT description AS name FROM name WHERE "column"='serviceSelection' ORDER BY index;`
    db.any(serviceQuery)
        .then(services => {
            services.forEach(service => { service.proposals = [] })
            db.any(query2)
                .then(data => {
                    data.forEach(proposal => {
                        const index = services.findIndex(service => service.name === proposal.serviceSelection)
                        if (index >= 0) services[index].proposals.push(proposal)
                    })
                    res.status(200).send(services)
                })
                .catch(error => {
                    console.log('ERROR:', error)
                    res.status(500).send('There was an error fetching data.')
                })
        })
}

// /proposals/by-tic
exports.byTic = (req, res) => {
    let ticQuery = `SELECT description AS name FROM name WHERE "column"='assignToInstitution' ORDER BY index;`
    db.any(ticQuery)
        .then(tics => {
            tics.forEach(tic => { tic.proposals = [] })
            db.any(proposalsQuery)
                .then(data => {
                    data.forEach(proposal => {
                        const index = tics.findIndex(({ name }) => name === proposal.assignToInstitution)
                        if (index >= 0) tics[index].proposals.push(proposal)
                    })
                    res.status(200).send(tics)
                })
                .catch(error => {
                    console.log('ERROR:', error)
                    res.status(500).send('There was an error fetching data.')
                })
        })
}

// /proposals/by-organization
exports.byOrganization = (req, res) => {
    const organizationQuery = `SELECT description AS name FROM name WHERE "column"='submitterInstitution' ORDER BY index;`
    db.any(organizationQuery)
        .then(organizations => {
            organizations.forEach(organization => { organization.proposals = [] })
            db.any(proposalsQuery)
                .then(proposals => {
                    proposals.forEach(proposal => {
                        const index = organizations.findIndex(organization => organization.name === proposal.submitterInstitution)
                        if (index >= 0) organizations[index].proposals.push(proposal)
                    })
                    res.status(200).send(organizations)
                })
                .catch(error => {
                    console.log('ERROR:', error)
                    res.status(500).send('There was an error fetching data.')
                })
        })
}

// /proposals/by-therapeutic-area
exports.byTherapeuticArea = (req, res) => {
    const areasQuery = `SELECT description AS name FROM name WHERE "column"='therapeuticArea' ORDER BY index;`
    db.any(areasQuery)
        .then(areas => {
            areas.forEach(area => { area.proposals = [] })
            db.any(proposalsQuery)
                .then(proposals => {
                    proposals.forEach(proposal => {
                        proposal.submission_date = proposal.prop_submit ? proposal.prop_submit.toDateString() : null
                        const index = areas.findIndex(area => area.name === proposal.therapeuticArea)
                        if (index >= 0) areas[index].proposals.push(proposal)
                    })
                    res.status(200).send(areas)
                })
                .catch(error => {
                    console.log('ERROR:', error)
                    res.status(500).send('There was an error fetching data.')
                })
        })
}

// /proposals/by-date
exports.byDate = (req, res) => {
    db.any(proposalsQuery)
        .then(data => {
            data.map(proposal => {                            // streamline this
                proposal.day = proposal.dateSubmitted         // streamline this
            })                                                // streamline this
            dates = data.map(({ day }) => day || '')                // streamline this
            proposalsByDate = []
            dates.forEach(date => {
                const dateIndex = proposalsByDate.findIndex(proposal => proposal.day === date)
                if (dateIndex >= 0) {
                    proposalsByDate[dateIndex].value += 1
                } else {
                    proposalsByDate.push({ day: date, value: 1 })
                }
            })
            res.status(200).send(proposalsByDate)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/approved-services
exports.approvedServices = (req, res) => {
    db.any(query3)
        .then(data => {
            let newData = []
            data.forEach(proposal => {
                proposal.proposal_id = parseInt(proposal.proposal_id)
                const proposalIndex = newData.findIndex(q => q.proposal_id === proposal.proposal_id)
                if (proposalIndex >= 0) {
                    newData[proposalIndex].services_approved.push(proposal.service_approved)
                } else {
                    newData.push({
                        proposal_id: proposal.proposal_id,
                        services_approved: [proposal.service_approved],
                        meeting_date: proposal.meeting_date.toDateString(),
                    })
                }
            })
            res.status(200).send(newData)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}


// /proposals/submitted-services
exports.submittedServices = (req, res) => {
    db.any(query2)
        .then(data => {
            let newData = []
            data.forEach(prop => {
                prop.proposal_id = parseInt(prop.proposal_id)
                const propIndex = newData.findIndex(q => q.proposal_id === prop.proposal_id)
                if (propIndex >= 0) {
                    newData[propIndex].new_service_selection.push(prop.new_service_selection)
                } else {
                    newData.push({
                        proposal_id: prop.proposal_id,
                        new_service_selection: [prop.new_service_selection],
                        meeting_date: prop.meeting_date.toDateString(),
                    })
                }
            })
            res.status(200).send(newData)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/network
exports.proposalsNetwork = (req, res) => {
    db.any(proposalsQuery)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// // Submitted for Services
// /////////////////////////

// // /proposals/count/submitted-for-services/
// exports.countSubmittedForServices = (req, res) => {
//     db.task(t => {
//         return t.any(proposalsQuery)
//             .then(data => {
//                 const proposals = data.map(prop => ({
//                     ...prop,
//                     requestedServices: [],
//                     approvedServices: [],
//                 }))
//                 return t.any(requestedServicesQuery)
//                     .then(data => {
//                         data.forEach(prop_serv => {
//                             const propIndex = proposals.findIndex(prop => prop.proposalID === prop_serv.proposalID)
//                             if (propIndex >= 0) proposals[propIndex].requestedServices.push(prop_serv.service)
//                         })
//                         return t.any(approvedServicesQuery)
//                             .then(data => {
//                                 data.forEach(prop_serv => {
//                                     const propIndex = proposals.findIndex(prop => prop.proposalID === prop_serv.proposalID)
//                                     if (propIndex >= 0) proposals[propIndex].approvedServices.push(prop_serv.service)
//                                 })
//                                 return proposals
//                             })
//                     })
//             })
//     })
//         .then(proposals => res.status(200).send(proposals))
//         .catch(error => {
//             console.log('ERROR:', error)
//             res.status(500).send('There was an error fetching data.')
//         })
// }

// // /proposals/count/submitted-for-services/by-institution
// exports.countSubmittedForServicesByInstitution = (req, res) => {
//     const query = `SELECT name2.description AS org_name, CAST(COUNT(*) AS INT)
//         FROM proposal
//         INNER JOIN name AS name2 ON name2.index=cast(proposal.org_name AS varchar)
//             AND name2."column"='org_name'
//         WHERE proposal.redcap_repeat_instrument is null
//             AND proposal.redcap_repeat_instance is null
//             AND proposal.conso_or_services='2'
//         GROUP BY name2.description;`
//     db.any(query)
//         .then(data => res.status(200).send(data))
//         .catch(error => {
//             console.log('ERROR:', error)
//             res.status(500).send('There was an error fetching data.')
//         })
// }

// // /proposals/count/submitted-for-services/by-tic
// exports.countSubmittedForServicesByTic = (req, res) => {
//     const query = `SELECT name2.description AS tic_name, CAST(COUNT(*) AS INT)
//         FROM proposal
//         INNER JOIN name AS name2 ON name2.index=cast(proposal.assignToInstitution AS varchar)
//             AND name2."column"='assignToInstitution'
//         WHERE proposal.redcap_repeat_instrument is null
//             AND proposal.redcap_repeat_instance is null
//             AND proposal.conso_or_services='2'
//         GROUP BY name2.description;`
//     db.any(query)
//         .then(data => res.status(200).send(data))
//         .catch(error => {
//             console.log('ERROR:', error)
//             res.status(500).send('There was an error fetching data.')
//         })
// }

// // /proposals/count/submitted-for-services/by-therapeutic-area
// exports.countSubmittedForServicesByTherapeuticArea = (req, res) => {
//     const query = `SELECT name2.description AS therapeutic_area, CAST(COUNT(*) AS INT)
//         FROM proposal
//         INNER JOIN study ON proposal.proposal_id=study.proposal_id
//         INNER JOIN name AS name2 ON name2.index=cast(study.theraputic_area AS varchar)
//             AND name2."column"='theraputic_area'
//         WHERE proposal.redcap_repeat_instrument is null
//             AND proposal.redcap_repeat_instance is null
//             AND proposal.conso_or_services='2'
//         GROUP BY name2.description;`
//     db.any(query)
//         .then(data => res.status(200).send(data))
//         .catch(error => {
//             console.log('ERROR:', error)
//             res.status(500).send('There was an error fetching data.')
//         })
// }

// // /proposals/count/submitted-for-services/by-year
// exports.countSubmittedForServicesByYear = (req, res) => {
//     const query = `SELECT extract(year from prop_submit) AS year, CAST(COUNT(*) AS INT)
//         FROM proposal
//         WHERE proposal.redcap_repeat_instrument IS NULL
//             AND proposal.redcap_repeat_instance IS NULL
//             AND proposal.conso_or_services='2'
//         GROUP BY year
//         ORDER BY year;`
//     db.any(query)
//         .then(data => res.status(200).send(data))
//         .catch(error => {
//             console.log('ERROR:', error)
//             res.status(500).send('There was an error fetching data.')
//         })
// }

// // /proposals/count/submitted-for-services/by-month
// exports.countSubmittedForServicesByMonth = (req, res) => {
//     const query = `SELECT extract(month from prop_submit) AS month, CAST(COUNT(*) AS INT)
//         FROM proposal
//         WHERE proposal.redcap_repeat_instrument IS NULL
//             AND proposal.redcap_repeat_instance IS NULL
//             AND proposal.conso_or_services='2'
//         GROUP BY month
//         ORDER BY month;`
//     db.any(query)
//         .then(data => res.status(200).send(data))
//         .catch(error => {
//             console.log('ERROR:', error)
//             res.status(500).send('There was an error fetching data.')
//         })
// }

// // Resubmissions
// ////////////////

// // /proposals/resubmissions
// exports.resubmissions = (req, res) => {
//     // filter by status 21
//     db.any(proposalsQuery)
//         .then(data => {
//             res.status(200).send(data)
//         })
//         .catch(error => {
//             console.log('ERROR:', error)
//             res.status(500).send('There was an error fetching data.')
//         })
// }

// // /proposals/count
// exports.countResubmissions = (req, res) => {
//     const query = `SELECT CAST(COUNT(*) AS INT)
//         FROM proposal
//         WHERE proposal.protocol_status='21';`
//     db.any(query)
//         .then(data => {
//             res.status(200).send(data)
//         })
//         .catch(error => {
//             console.log('ERROR:', error)
//             res.status(500).send('There was an error fetching data.')
//         })
// }

// // /proposals/count
// exports.countResubmissionsByInstitution = (req, res) => {
//     const query = `SELECT name2.description as org_name, CAST(COUNT(*) AS INT)
//         FROM proposal
//         INNER JOIN name AS name2 ON name2.index=cast(proposal.org_name as varchar)
//             AND name2."column"='org_name'
//         WHERE proposal.redcap_repeat_instrument IS NULL
//             AND proposal.redcap_repeat_instance IS NULL
//             AND proposal.protocol_status='21'
//         GROUP BY name2.description;`
//     db.any(query)
//         .then(data => {
//             res.status(200).send(data)
//         })
//         .catch(error => {
//             console.log('ERROR:', error)
//             res.status(500).send('There was an error fetching data.')
//         })
// }

// // /proposals/count
// exports.countResubmissionsByTic = (req, res) => {
//     const query = `SELECT name2.description as tic_ric_assign, CAST(COUNT(*) AS INT)
//         FROM proposal
//         INNER JOIN name AS name2 ON name2.index=cast(proposal.assignToInstitution as varchar)
//             AND name2."column"='assignToInstitution'
//         WHERE proposal.redcap_repeat_instrument IS NULL
//             AND proposal.redcap_repeat_instance IS NULL
//             AND proposal.protocol_status='21'
//         GROUP BY name2.description;`
//     db.any(query)
//         .then(data => {
//             res.status(200).send(data)
//         })
//         .catch(error => {
//             console.log('ERROR:', error)
//             res.status(500).send('There was an error fetching data.')
//         })
// }

// // /proposals/count
// exports.countResubmissionsByTherapeuticArea = (req, res) => {
//     const query = `SELECT name2.description AS therapeutic_area, CAST(COUNT(*) AS INT)
//         FROM proposal
//         INNER JOIN study ON proposal.proposal_id=study.proposal_id
//         INNER JOIN name AS name2 ON name2.index=cast(study.theraputic_area as varchar)
//             AND name2."column"='theraputic_area'
//         WHERE proposal.redcap_repeat_instrument IS NULL
//             AND proposal.redcap_repeat_instance IS NULL
//             AND proposal.protocol_status='21'
//         GROUP BY name2.description;`
//     db.any(query)
//         .then(data => {
//             res.status(200).send(data)
//         })
//         .catch(error => {
//             console.log('ERROR:', error)
//             res.status(500).send('There was an error fetching data.')
//         })
// }

// //
// ////////////

// // /proposals/approved-for-services/count
// exports.countApprovedForServices = (req, res) => {
//     const query = ``
//     db.any(query)
//         .then(data => {
//             res.status(200).send(data)
//         })
//         .catch(error => {
//             console.log('ERROR:', error)
//             res.status(500).send('There was an error fetching data.')
//         })
// }

// // /proposals/approved-for-services/count/by-institution
// exports.countApprovedForServicesByInstitution = (req, res) => {
//     const query = ``
//     db.any(query)
//         .then(data => {
//             res.status(200).send(data)
//         })
//         .catch(error => {
//             console.log('ERROR:', error)
//             res.status(500).send('There was an error fetching data.')
//         })
// }

// // /proposals/approved-for-services/count/by-tic
// exports.countApprovedForServicesByTic = (req, res) => {
//     const query = ``
//     db.any(query)
//         .then(data => {
//             res.status(200).send(data)
//         })
//         .catch(error => {
//             console.log('ERROR:', error)
//             res.status(500).send('There was an error fetching data.')
//         })
// }

// // /proposals/approved-for-services/count/by-therapeutic-area
// exports.countApprovedForServicesByTherapeuticArea = (req, res) => {
//     const query = ``
//     db.any(query)
//         .then(data => {
//             res.status(200).send(data)
//         })
//         .catch(error => {
//             console.log('ERROR:', error)
//             res.status(500).send('There was an error fetching data.')
//         })
// }

// // /proposals/approved-for-services/count/by-year
// exports.countApprovedForServicesByYear = (req, res) => {
//     const query = ``
//     db.any(query)
//         .then(data => {
//             res.status(200).send(data)
//         })
//         .catch(error => {
//             console.log('ERROR:', error)
//             res.status(500).send('There was an error fetching data.')
//         })
// }

// // /proposals/approved-for-services/count/by-month
// exports.countApprovedForServicesByMonth = (req, res) => {
//     const query = ``
//     db.any(query)
//         .then(data => {
//             res.status(200).send(data)
//         })
//         .catch(error => {
//             console.log('ERROR:', error)
//             res.status(500).send('There was an error fetching data.')
//         })
// }

// // /proposals/count-days/submission-to-approval
// exports.daysBetweenSubmissionAndApproval = (req, res) => {
//     // calculate days between meeting_date_2 and prop_submit, filter by protocol_status NOT IN ('3', '40')
//     db.any(query)
//         .then(data => {
//             res.status(200).send(data)
//         })
//         .catch(error => {
//             console.log('ERROR:', error)
//             res.status(500).send('There was an error fetching data.')
//         })
// }


// // /proposals/count-days/approval-to-grant-submission
// exports.daysBetweenApprovalAndGrantSubmission = (req, res) => {
//     // calculate days between grant_sub_complete and meeting_date_2, filter by protocol_status IN ('7', '25')
//     db.any(query)
//         .then(data => {
//             res.status(200).send(data)
//         })
//         .catch(error => {
//             console.log('ERROR:', error)
//             res.status(500).send('There was an error fetching data.')
//         })
// }

// // /proposals/count-days/tin-submission-to-grant-submission
// exports.daysBetweenTinSubmissionAndGrantSubmission = (req, res) => {
//     // calculate days between grant_sub_complete and prop_submit, filter by protocol_status IN ('7', '25')
//     db.any(query)
//         .then(data => {
//             res.status(200).send(data)
//         })
//         .catch(error => {
//             console.log('ERROR:', error)
//             res.status(500).send('There was an error fetching data.')
//         })
// }
