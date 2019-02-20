const db = require('../config/database')
// const { compareIds } = require('../utils/helpers')

// Controllers
//////////////

// /proposals/:id(\\d+)
exports.getOne = (req, res) => {
    const query = `SELECT * FROM proposal WHERE proposal_id=${ req.params.id };`
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
    const query = `SELECT DISTINCT
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
    db.any(query)
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
    let statusQuery = `SELECT description AS name
        FROM name
        WHERE "column"='protocol_status' ORDER BY index;`
    db.any(statusQuery)
        .then(statuses => {
            statuses.forEach(status => { status.proposals = [] })
            const query = `SELECT DISTINCT
                    CAST(proposal.proposal_id AS INT),
                    proposal.short_name,
                    proposal.prop_submit,
                    name.description AS proposal_status,
                    name2.description AS tic_name,
                    name3.description AS org_name,
                    name4.description AS therapeutic_area,
                    funding.anticipated_budget, funding.funding_duration,
                    proposal.redcap_repeat_instrument, proposal.redcap_repeat_instance,
                    TRIM(CONCAT(proposal.pi_firstname, ' ', proposal.pi_lastname)) AS "pi_name"
                FROM proposal
                INNER JOIN study ON proposal.proposal_id=study.proposal_id
                INNER JOIN funding ON proposal.proposal_id=funding.proposal_id and proposal.redcap_repeat_instrument IS NULL and funding.redcap_repeat_instrument is null
                INNER JOIN "PI" ON "PI".pi_firstname=proposal.pi_firstname AND "PI".pi_lastname=proposal.pi_lastname
                INNER JOIN name ON name.index=CAST(proposal.protocol_status AS VARCHAR) AND name."column"='protocol_status'
                LEFT JOIN name name2 ON name2.index=CAST(proposal.tic_ric_assign_v2 AS VARCHAR) AND name2."column"='tic_ric_assign_v2'
                INNER JOIN name name3 ON name3.index=CAST(proposal.org_name AS VARCHAR) AND name3."column"='org_name'
                INNER JOIN name name4 ON name4.index=CAST(study.theraputic_area AS VARCHAR)
                WHERE name4."column"='theraputic_area';`
            db.any(query)
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
    let serviceQuery = `SELECT description AS name
        FROM name
        WHERE "column"='new_service_selection' ORDER BY index;`
    db.any(serviceQuery)
        .then(services => {
            services.forEach(service => { service.proposals = [] })
            const query = `SELECT DISTINCT
                    CAST(proposal.proposal_id AS INT),
                    proposal.short_name,
                    name.description AS proposal_status,
                    name2.description AS tic_name,
                    name3.description AS org_name,
                    name4.description AS new_service_selection,
                    funding.anticipated_budget, funding.funding_duration,
                    proposal.redcap_repeat_instrument, proposal.redcap_repeat_instance,
                    TRIM(CONCAT(proposal.pi_firstname, ' ', proposal.pi_lastname)) AS "pi_name"
                FROM proposal
                INNER JOIN funding ON proposal.proposal_id=funding.proposal_id and proposal.redcap_repeat_instrument IS NULL and funding.redcap_repeat_instrument is null
                INNER JOIN "PI" ON "PI".pi_firstname=proposal.pi_firstname AND "PI".pi_lastname=proposal.pi_lastname
                INNER JOIN proposal_new_service_selection ON proposal.proposal_id = proposal_new_service_selection.proposal_id
                INNER JOIN name ON name.index=CAST(proposal.protocol_status AS VARCHAR) AND name."column"='protocol_status'
                LEFT JOIN name name2 ON name2.index=CAST(proposal.tic_ric_assign_v2 AS VARCHAR) AND name2."column"='tic_ric_assign_v2'
                INNER JOIN name name3 ON name3.index=CAST(proposal.org_name AS VARCHAR) AND name3."column"='org_name'
                INNER JOIN name name4 ON name4.id=proposal_new_service_selection.new_service_selection AND name4."column"='new_service_selection';`
            db.any(query)
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
    let ticQuery = `SELECT index, description AS name FROM name WHERE "column"='tic_ric_assign_v2' ORDER BY index;`
    db.any(ticQuery)
        .then(tics => {
            tics.forEach(tic => { tic.proposals = [] })
            const query = `SELECT DISTINCT
                    CAST(proposal.proposal_id AS INT),
                    proposal.short_name,
                    proposal.prop_submit,
                    TRIM(CONCAT(proposal.pi_firstname, ' ', proposal.pi_lastname)) AS "pi_name",
                    proposal.tic_ric_assign_v2,
                    name2.description AS tic_name,
                    name3.description AS org_name,
                    name4.description AS therapeutic_area,
                    name.description AS proposal_status,
                    CAST(proposal.protocol_status AS INT), funding.anticipated_budget, funding.funding_duration
                FROM proposal
                INNER JOIN study ON proposal.proposal_id=study.proposal_id
                INNER JOIN funding ON proposal.proposal_id=funding.proposal_id and proposal.redcap_repeat_instrument IS NULL and funding.redcap_repeat_instrument is null
                INNER JOIN "PI" ON "PI".pi_firstname=proposal.pi_firstname AND "PI".pi_lastname=proposal.pi_lastname
                INNER JOIN name ON name.index=CAST(proposal.protocol_status AS VARCHAR) and name."column"='protocol_status'
                LEFT JOIN name name2 ON name2.index=CAST(proposal.tic_ric_assign_v2 AS VARCHAR) AND name2."column"='tic_ric_assign_v2'
                INNER JOIN name name3 ON name3.index=CAST(proposal.org_name AS VARCHAR) AND name3."column"='org_name'
                INNER JOIN name name4 ON name4.index=CAST(study.theraputic_area AS VARCHAR)
                WHERE name4."column"='theraputic_area';`
            db.any(query)
                .then(data => {
                    data.forEach(proposal => {
                        // console.log(proposal)
                        proposal.submission_date = proposal.prop_submit ? proposal.prop_submit.toDateString() : null
                        const index = tics.findIndex(tic => tic.index === proposal.tic_ric_assign_v2)
                        proposal.tic_ric_assign_v2 = parseInt(proposal.tic_ric_assign_v2)
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
            const query = `SELECT DISTINCT
                    CAST(proposal.proposal_id AS INT),
                    proposal.short_name,
                    proposal.prop_submit,
                    name.description AS proposal_status,
                    name2.description AS tic_name,
                    name3.description AS org_name,
                    name4.description AS therapeutic_area,
                    funding.anticipated_budget, funding.funding_duration,
                    proposal.redcap_repeat_instrument, proposal.redcap_repeat_instance,
                    TRIM(CONCAT(proposal.pi_firstname, ' ', proposal.pi_lastname)) AS "pi_name"
                FROM proposal
                INNER JOIN study ON proposal.proposal_id=study.proposal_id
                INNER JOIN funding ON proposal.proposal_id=funding.proposal_id and proposal.redcap_repeat_instrument IS NULL and funding.redcap_repeat_instrument is null
                INNER JOIN "PI" ON "PI".pi_firstname=proposal.pi_firstname AND "PI".pi_lastname=proposal.pi_lastname
                INNER JOIN name ON name.index=CAST(proposal.protocol_status AS VARCHAR) AND name."column"='protocol_status'
                LEFT JOIN name name2 ON name2.index=CAST(proposal.tic_ric_assign_v2 AS VARCHAR) AND name2."column"='tic_ric_assign_v2'
                INNER JOIN name name3 ON name3.index=CAST(proposal.org_name AS VARCHAR) AND name3."column"='org_name'
                INNER JOIN name name4 ON name4.index=CAST(study.theraputic_area AS VARCHAR)
                WHERE name4."column"='theraputic_area';`
            db.any(query)
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
            const query = `SELECT DISTINCT
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
            db.any(query)
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
    const query = `SELECT DISTINCT
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
                // Convert day to YYYY-MM-DD format
                proposal.day = proposal.prop_submit.substring(0, 10)
                // Kill the long timestamp
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
    const query = `SELECT DISTINCT vote.proposal_id, vote.meeting_date, name.description AS service_approved
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
    const query = `SELECT DISTINCT vote.proposal_id, vote.meeting_date, name.description AS new_service_selection
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
    const query = `SELECT DISTINCT
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
        INNER JOIN funding ON proposal.proposal_id=funding.proposal_id and proposal.redcap_repeat_instrument IS NULL and funding.redcap_repeat_instrument is null
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

// Submitted for Services
/////////////////////////

// /proposals/count/submitted-for-services/
exports.countSubmittedForServices = (req, res) => {
    const query = `SELECT CAST(COUNT(*) AS INT)
        FROM proposal
        WHERE conso_or_services='2';`
    db.any(query)
        .then(data => res.status(200).send(data[0]))
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/count/submitted-for-services/by-institution
exports.countSubmittedForServicesByInstitution = (req, res) => {
    const query = `SELECT name2.description AS org_name, CAST(COUNT(*) AS INT)
        FROM proposal
        INNER JOIN name AS name2 ON name2.index=cast(proposal.org_name AS varchar)
            AND name2."column"='org_name'
        WHERE proposal.redcap_repeat_instrument is null
            AND proposal.redcap_repeat_instance is null
            AND proposal.conso_or_services='2'
        GROUP BY name2.description;`
    db.any(query)
        .then(data => res.status(200).send(data))
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/count/submitted-for-services/by-tic
exports.countSubmittedForServicesByTic = (req, res) => {
    const query = `SELECT name2.description AS tic_name, CAST(COUNT(*) AS INT)
        FROM proposal
        INNER JOIN name AS name2 ON name2.index=cast(proposal.tic_ric_assign_v2 AS varchar)
            AND name2."column"='tic_ric_assign_v2'
        WHERE proposal.redcap_repeat_instrument is null
            AND proposal.redcap_repeat_instance is null
            AND proposal.conso_or_services='2'
        GROUP BY name2.description;`
    db.any(query)
        .then(data => res.status(200).send(data))
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/count/submitted-for-services/by-therapeutic-area
exports.countSubmittedForServicesByTherapeuticArea = (req, res) => {
    const query = `SELECT name2.description AS therapeutic_area, CAST(COUNT(*) AS INT)
        FROM proposal
        INNER JOIN study ON proposal.proposal_id=study.proposal_id
        INNER JOIN name AS name2 ON name2.index=cast(study.theraputic_area AS varchar)
            AND name2."column"='theraputic_area'
        WHERE proposal.redcap_repeat_instrument is null
            AND proposal.redcap_repeat_instance is null
            AND proposal.conso_or_services='2'
        GROUP BY name2.description;`
    db.any(query)
        .then(data => res.status(200).send(data))
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/count/submitted-for-services/by-year
exports.countSubmittedForServicesByYear = (req, res) => {
    const query = `SELECT extract(year from prop_submit) AS year, CAST(COUNT(*) AS INT)
        FROM proposal
        WHERE proposal.redcap_repeat_instrument IS NULL
            AND proposal.redcap_repeat_instance IS NULL
            AND proposal.conso_or_services='2'
        GROUP BY year
        ORDER BY year;`
    db.any(query)
        .then(data => res.status(200).send(data))
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/count/submitted-for-services/by-month
exports.countSubmittedForServicesByMonth = (req, res) => {
    const query = `SELECT extract(month from prop_submit) AS month, CAST(COUNT(*) AS INT)
        FROM proposal
        WHERE proposal.redcap_repeat_instrument IS NULL
            AND proposal.redcap_repeat_instance IS NULL
            AND proposal.conso_or_services='2'
        GROUP BY month
        ORDER BY month;`
    db.any(query)
        .then(data => res.status(200).send(data))
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// Resubmissions
////////////////

// /proposals/resubmissions
exports.resubmissions = (req, res) => {
    const query = `SELECT
            proposal.proposal_id, name2.description AS services_approved,service_services_approved,
            name3.description AS funding,
            funding.funding
        FROM proposal
        INNER JOIN service ON proposal.proposal_id=service.proposal_id
        INNER JOIN funding ON funding.proposal_id=service.proposal_id
        INNER JOIN service_services_approved ON proposal.proposal_id=service_services_approved.proposal_id
        INNER JOIN name AS name3 on name3.index=cast(funding.funding as varchar)
            AND name3."column"='funding'
        INNER JOIN name AS name2 on name2.id=service_services_approved.services_approved
            AND name2."column"='services_approved'
        WHERE proposal.redcap_repeat_instrument IS NULL
            AND service.redcap_repeat_instrument IS NULL
            AND proposal.redcap_repeat_instance IS NULL
            AND service.redcap_repeat_instance IS NULL
            AND funding.redcap_repeat_instrument IS NULL
            AND funding.redcap_repeat_instance IS NULL
            AND proposal.redcap_repeat_instance IS NULL
            AND proposal.redcap_repeat_instrument IS NULL
            AND proposal.protocol_status='21'
        ORDER BY proposal.proposal_id;`
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/count
exports.countResubmissions = (req, res) => {
    const query = `SELECT CAST(COUNT(*) AS INT)
        FROM proposal
        WHERE proposal.protocol_status='21';`
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/count
exports.countResubmissionsByInstitution = (req, res) => {
    const query = `SELECT name2.description as org_name, CAST(COUNT(*) AS INT)
        FROM proposal
        INNER JOIN name AS name2 ON name2.index=cast(proposal.org_name as varchar)
            AND name2."column"='org_name'
        WHERE proposal.redcap_repeat_instrument IS NULL
            AND proposal.redcap_repeat_instance IS NULL
            AND proposal.protocol_status='21'
        GROUP BY name2.description;`
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/count
exports.countResubmissionsByTic = (req, res) => {
    const query = `SELECT name2.description as tic_ric_assign, CAST(COUNT(*) AS INT)
        FROM proposal
        INNER JOIN name AS name2 ON name2.index=cast(proposal.tic_ric_assign_v2 as varchar)
            AND name2."column"='tic_ric_assign_v2'
        WHERE proposal.redcap_repeat_instrument IS NULL
            AND proposal.redcap_repeat_instance IS NULL
            AND proposal.protocol_status='21'
        GROUP BY name2.description;`
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/count
exports.countResubmissionsByTherapeuticArea = (req, res) => {
    const query = `SELECT name2.description AS therapeutic_area, CAST(COUNT(*) AS INT)
        FROM proposal
        INNER JOIN study ON proposal.proposal_id=study.proposal_id
        INNER JOIN name AS name2 ON name2.index=cast(study.theraputic_area as varchar)
            AND name2."column"='theraputic_area'
        WHERE proposal.redcap_repeat_instrument IS NULL
            AND proposal.redcap_repeat_instance IS NULL
            AND proposal.protocol_status='21'
        GROUP BY name2.description;`
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

//
////////////

// /proposals/approved-for-services/count
exports.countApprovedForServices = (req, res) => {
    const query = ``
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/approved-for-services/count/by-institution
exports.countApprovedForServicesByInstitution = (req, res) => {
    const query = ``
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/approved-for-services/count/by-tic
exports.countApprovedForServicesByTic = (req, res) => {
    const query = ``
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/approved-for-services/count/by-therapeutic-area
exports.countApprovedForServicesByTherapeuticArea = (req, res) => {
    const query = ``
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/approved-for-services/count/by-year
exports.countApprovedForServicesByYear = (req, res) => {
    const query = ``
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/approved-for-services/count/by-month
exports.countApprovedForServicesByMonth = (req, res) => {
    const query = ``
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/count-days/submission-to-approval
exports.daysBetweenSubmissionAndApproval = (req, res) => {
    const query = `SELECT 
            CAST(proposal2.proposal_id AS INT),
            proposal2.short_name,
            name2.description AS tic_name,
            name3.description AS org_name,
            name4.description AS therapeutic_area,
            proposal2.prop_submit,
            meeting_date_2,
            name.description AS proposal_status,
            DATE_PART('day', meeting_date_2 :: timestamp - proposal2.prop_submit :: timestamp) AS day_count
        FROM (SELECT *, COALESCE(proposal.tic_ric_assign_v2, proposal.tic_ric_assign) AS tic_ric_assign2 from proposal) proposal2  
        INNER JOIN vote ON proposal2.proposal_id = vote.proposal_id
        INNER JOIN name ON name.index=CAST(proposal2.protocol_status AS VARCHAR) AND name."column"='protocol_status'
        INNER JOIN name name2 ON name2.index=CAST(proposal2.tic_ric_assign2 AS VARCHAR)
        INNER JOIN name name3 ON name3.index=CAST(proposal2.org_name AS VARCHAR)
        INNER JOIN study ON proposal2.proposal_id=study.proposal_id
        INNER JOIN name name4 ON name4.index=CAST(study.theraputic_area AS VARCHAR)
        WHERE proposal2.protocol_status NOT IN ('3', '40')
          AND proposal2.redcap_repeat_instrument IS NULL
          AND proposal2.redcap_repeat_instance IS NULL
          AND meeting_date_2 IS NOT NULL
          AND name2."column"='tic_ric_assign_v2'
          AND name3."column"='org_name'
          AND name4."column"='theraputic_area'
        ORDER BY proposal2.proposal_id;`
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}


// /proposals/count-days/approval-to-grant-submission
exports.daysBetweenApprovalAndGrantSubmission = (req, res) => {
    const query = `SELECT
            CAST(proposal2.proposal_id AS INT),
            proposal2.short_name,
            name2.description AS tic_name,
            name3.description AS org_name,
            name4.description AS therapeutic_area,
            proposal2.grant_sub_complete,
            meeting_date_2,
            name.description AS proposal_status,
            DATE_PART('day', proposal2.grant_sub_complete :: timestamp - meeting_date_2:: timestamp) AS day_count
        FROM (SELECT *, COALESCE(proposal.tic_ric_assign_v2, proposal.tic_ric_assign) AS tic_ric_assign2 from proposal) proposal2
        INNER JOIN vote ON proposal2.proposal_id = vote.proposal_id
        INNER JOIN name ON name.index=CAST(proposal2.protocol_status AS VARCHAR) AND name."column"='protocol_status'
        INNER JOIN name name2 ON name2.index=CAST(proposal2.tic_ric_assign2 AS VARCHAR)
        INNER JOIN name name3 ON name3.index=CAST(proposal2.org_name AS VARCHAR)
        INNER JOIN study ON proposal2.proposal_id=study.proposal_id
        INNER JOIN name name4 ON name4.index=CAST(study.theraputic_area AS VARCHAR)
        WHERE proposal2.protocol_status IN ('7', '25')
        AND proposal2.redcap_repeat_instrument IS NULL
        AND proposal2.redcap_repeat_instance IS NULL
        AND meeting_date_2 IS NOT NULL
        AND name2."column"='tic_ric_assign_v2'
        AND name3."column"='org_name'
        AND name4."column"='theraputic_area'
        ORDER BY proposal2.proposal_id;`
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/count-days/tin-submission-to-grant-submission
exports.daysBetweenTinSubmissionAndGrantSubmission = (req, res) => {
    const query = `SELECT
            CAST(proposal2.proposal_id AS INT),
            proposal2.short_name,
            name2.description AS tic_name,
            name3.description AS org_name,
            name4.description AS therapeutic_area,
            proposal2.grant_sub_complete,
            proposal2.prop_submit,
            name.description AS proposal_status,
            DATE_PART('day', proposal2.grant_sub_complete :: timestamp - proposal2.prop_submit:: timestamp) AS day_count
        FROM (SELECT *, COALESCE(proposal.tic_ric_assign_v2, proposal.tic_ric_assign) AS tic_ric_assign2 from proposal) proposal2
        INNER JOIN vote ON proposal2.proposal_id = vote.proposal_id
        INNER JOIN name ON name.index=CAST(proposal2.protocol_status AS VARCHAR) AND name."column"='protocol_status'
        INNER JOIN name name2 ON name2.index=CAST(proposal2.tic_ric_assign2 AS VARCHAR)
        INNER JOIN name name3 ON name3.index=CAST(proposal2.org_name AS VARCHAR)
        INNER JOIN study ON proposal2.proposal_id=study.proposal_id
        INNER JOIN name name4 ON name4.index=CAST(study.theraputic_area AS VARCHAR)
        WHERE proposal2.protocol_status IN ('7', '25')
        AND proposal2.redcap_repeat_instrument IS NULL
        AND proposal2.redcap_repeat_instance IS NULL
        AND proposal2.prop_submit IS NOT NULL
        AND name2."column"='tic_ric_assign_v2'
        AND name3."column"='org_name'
        AND name4."column"='theraputic_area'
        ORDER BY proposal2.proposal_id;`
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}
