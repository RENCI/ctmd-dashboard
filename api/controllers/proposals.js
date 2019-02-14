const db = require('../config/database')
// const { compareIds } = require('../utils/helpers')

// Controllers
//////////////

const proposalsQuery = `SELECT DISTINCT
        CAST(proposal.proposal_id AS INT),
        proposal.short_name,
        proposal.prop_submit,
        TRIM(CONCAT(proposal.pi_firstname, ' ', proposal.pi_lastname)) AS pi_name,
        name.description AS proposal_status,
        name2.description AS tic_name,
        name3.description AS org_name,
        name4.description AS therapeutic_area
    FROM proposal
    INNER JOIN study ON proposal.proposal_id=study.proposal_id
    INNER JOIN name ON name.index=CAST(proposal.protocol_status AS VARCHAR)
    INNER JOIN name name2 ON name2.index=CAST(proposal.tic_ric_assign_v2 AS VARCHAR) AND name2."column"='tic_ric_assign_v2'
    INNER JOIN name name3 ON name3.index=CAST(proposal.org_name AS VARCHAR) AND name3."column"='org_name'
    INNER JOIN name name4 ON name4.index=CAST(study.theraputic_area AS VARCHAR)
    WHERE name."column"='protocol_status'
      AND name2."column"='tic_ric_assign_v2'
      AND name4."column"='theraputic_area'
    ORDER BY proposal_id;`

// /proposals/:id(\\d+)
exports.getOne = (req, res) => {
    query = `SELECT * FROM proposal WHERE proposal_id=${ req.params.id };`
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals
exports.list = (req, res) => {
    db.any(proposalsQuery)
        .then(data => {
            data.forEach(proposal => {
                proposal.submission_date = proposal.prop_submit.toDateString()
            })
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/by-status
exports.byStatus = (req, res) => {
    let query = `SELECT description AS name
        FROM name
        WHERE "column"='protocol_status' ORDER BY index;`
    db.any(query)
        .then(statuses => {
            statuses.forEach(status => { status.proposals = [] })
            db.any(proposalsQuery)
                .then(data => {
                    data.forEach(proposal => {
                        proposal.submission_date = proposal.prop_submit ? proposal.prop_submit.toDateString() : null
                        const index = statuses.findIndex(status => status.name === proposal.proposal_status)
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
    let query = `SELECT description AS name
        FROM name
        WHERE "column"='new_service_selection' ORDER BY index;`
    db.any(proposalsQuery)
        .then(services => {
            services.forEach(service => { service.proposals = [] })
            db.any(proposalsQuery)
                .then(data => {
                    data.forEach(proposal => {
                        const index = services.findIndex(service => service.name === proposal.new_service_selection)
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
    let query = `SELECT description AS name FROM name WHERE "column"='tic_ric_assign_v2' ORDER BY index;`
    db.any(query)
        .then(tics => {
            tics.forEach(tic => { tic.proposals = [] })
            db.any(proposalsQuery)
                .then(data => {
                    data.forEach(proposal => {
                        proposal.submission_date = proposal.prop_submit ? proposal.prop_submit.toDateString() : null
                        const index = tics.findIndex(tic => tic.name === proposal.tic_name)
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
    const organizationQuery = `SELECT description AS name FROM name WHERE "column"='org_name' ORDER BY index;`
    db.any(organizationQuery)
        .then(organizations => {
            organizations.forEach(organization => { organization.proposals = [] })
            db.any(proposalsQuery)
                .then(proposals => {
                    proposals.forEach(proposal => {
                        proposal.submission_date = proposal.prop_submit ? proposal.prop_submit.toDateString() : null
                        const index = organizations.findIndex(organization => organization.name === proposal.org_name)
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
    const areasQuery = `SELECT description AS name FROM name WHERE "column"='theraputic_area' ORDER BY index;`
    db.any(areasQuery)
        .then(areas => {
            areas.forEach(area => { area.proposals = [] })
            db.any(proposalsQuery)
                .then(proposals => {
                    proposals.forEach(proposal => {
                        proposal.submission_date = proposal.prop_submit ? proposal.prop_submit.toDateString() : null
                        const index = areas.findIndex(area => area.name === proposal.therapeutic_area)
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
    query = `SELECT DISTINCT
            CAST(proposal.proposal_id AS INT),
            proposal.short_name,
            CAST(proposal.prop_submit AS VARCHAR)
        FROM proposal
        INNER JOIN name ON name.index=CAST(proposal.tic_ric_assign_v2 AS VARCHAR)
        INNER JOIN name name2 ON name2.index=CAST(proposal.tic_ric_assign_v2 AS VARCHAR) AND name2."column"='tic_ric_assign_v2'
        INNER JOIN name name3 ON name3.index=CAST(proposal.org_name AS VARCHAR) AND name3."column"='org_name'
        WHERE name."column"='protocol_status' AND name2."column"='tic_ric_assign_v2';`
    db.any(query)
        .then(data => {
            data.forEach(proposal => {
                // Convert day to YYYY-MM-DD format -- slice off first 10 characters -- and kill the long timestamp
                proposal.day = proposal.prop_submit.substring(0, 10)
                delete proposal.prop_submit
            })
            dates = data.map(({ day }) => day)
            proposalsByDate = []
            dates.forEach(date => {
                const dateIndex = proposalsByDate.findIndex((prop) => prop.day === date)
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
    query = `SELECT DISTINCT vote.proposal_id, vote.meeting_date, name.description AS service_approved
        FROM vote
        INNER JOIN service_services_approved ON vote.proposal_id=service_services_approved.proposal_id
        INNER JOIN name ON name.id=service_services_approved.services_approved
        WHERE vote.meeting_date IS NOT NULL ORDER BY vote.proposal_id;`
    db.any(query)
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
    query = `SELECT DISTINCT vote.proposal_id, vote.meeting_date, name.description AS new_service_selection
        FROM vote
        INNER JOIN proposal_new_service_selection ON vote.proposal_id=proposal_new_service_selection.proposal_id
        INNER JOIN name ON name.id=proposal_new_service_selection.new_service_selection
        WHERE vote.meeting_date IS NOT NULL ORDER BY vote.proposal_id;`
    db.any(query)
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
    query = `SELECT DISTINCT
            CAST(proposal.proposal_id AS INT),
            proposal.short_name,
            name.description AS proposal_status,
            name2.description AS tic_name,
            name3.description AS org_name,
            name4.description AS therapeutic_area,
            CAST(proposal.protocol_status AS INT),
            funding.anticipated_budget,
            funding.funding_duration,
            TRIM(CONCAT(proposal.pi_firstname, ' ', proposal.pi_lastname)) AS pi_name
        FROM proposal
        INNER JOIN funding ON proposal.proposal_id=funding.proposal_id and proposal.redcap_repeat_instrument is null and funding.redcap_repeat_instrument is null
        INNER JOIN "PI" ON "PI".pi_firstname=proposal.pi_firstname AND "PI".pi_lastname=proposal.pi_lastname
        INNER JOIN study ON proposal.proposal_id=study.proposal_id
        INNER JOIN name ON name.index=CAST(proposal.protocol_status AS VARCHAR)
        INNER JOIN name name2 ON name2.index=CAST(proposal.tic_ric_assign_v2 AS VARCHAR)
        INNER JOIN name name3 ON name3.index=CAST(proposal.org_name AS VARCHAR)
        INNER JOIN name name4 ON name4.index=CAST(study.theraputic_area AS VARCHAR)
        WHERE name."column"='protocol_status' AND name2."column"='tic_ric_assign_v2' AND name3."column"='org_name' AND name4."column"='theraputic_area'
        ORDER BY proposal_id;`
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}
