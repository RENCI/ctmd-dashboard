const db = require('../config/database')
const { compareIds } = require('../utils/helpers') 
// Controllers
//////////////

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
    query = `SELECT DISTINCT
            CAST(proposal.proposal_id AS INT),
            proposal.short_name,
            TRIM(CONCAT(proposal.pi_firstname, ' ', proposal.pi_lastname)) AS pi_name,
            proposal.prop_submit,
            name.description AS proposal_status,
            name2.description AS tic_name,
            name3.description AS org_name,
            name4.description AS therapeutic_area
        FROM proposal
        INNER JOIN name ON name.index=CAST(proposal.protocol_status AS VARCHAR)
        INNER JOIN study ON proposal.proposal_id=study.proposal_id
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
                proposal.submission_date = proposal.prop_submit.toDateString()
            })
            res.status(200).send(proposals)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/by-stage
exports.byStage = (req, res) => {
    let query = `SELECT description AS name
        FROM name
        WHERE "column"='protocol_status' ORDER BY index;`
    db.any(query)
        .then(stages => {
            stages.forEach(stage => { stage.proposals = [] })
            query = `SELECT DISTINCT
                    CAST(proposal.proposal_id AS INT),
                    proposal.short_name,
                    name.description AS proposal_status,
                    name2.description AS tic_name,
                    name3.description AS org_name,
                    funding.anticipated_budget, funding.funding_duration,
                    proposal.redcap_repeat_instrument, proposal.redcap_repeat_instance,
                    TRIM(CONCAT(proposal.pi_firstname, ' ', proposal.pi_lastname)) AS "pi_name"
                FROM proposal
                INNER JOIN funding ON proposal.proposal_id=funding.proposal_id and proposal.redcap_repeat_instrument is null and funding.redcap_repeat_instrument is null
                INNER JOIN "PI" ON "PI".pi_firstname=proposal.pi_firstname AND "PI".pi_lastname=proposal.pi_lastname
                INNER JOIN name ON name.index=CAST(proposal.protocol_status AS VARCHAR) AND name."column"='protocol_status'
                LEFT JOIN name name2 ON name2.index=CAST(proposal.tic_ric_assign_v2 AS VARCHAR) AND name2."column"='tic_ric_assign_v2'
                INNER JOIN name name3 ON name3.index=CAST(proposal.org_name AS VARCHAR) AND name3."column"='org_name';`
            db.any(query)
                .then(data => {
                    data.forEach(proposal => {
                        const index = stages.findIndex(stage => stage.name === proposal.proposal_status)
                        if (index >= 0) stages[index].proposals.push(proposal)
                    })
                    res.status(200).send(stages)
                })
                .catch(error => {
                    console.log('ERROR:', error)
                    res.status(500).send('There was an error fetching data.')
                })
        })
}

// /proposals/by-tic
exports.byTic = (req, res) => {
    let query = `SELECT index, description AS name FROM name WHERE "column"='tic_ric_assign_v2' ORDER BY index;`
    db.any(query)
        .then(tics => {
            tics.forEach(tic => { tic.proposals = [] })
            query = `SELECT DISTINCT
                    CAST(proposal.proposal_id AS INT),
                    proposal.short_name,
                    name.description AS proposal_status,
                    name2.description AS tic_name,
                    name3.description AS org_name,
                    proposal.tic_ric_assign_v2,
                    proposal.protocol_status, funding.anticipated_budget, funding.funding_duration,
                    proposal.redcap_repeat_instrument, proposal.redcap_repeat_instance,
                    TRIM(CONCAT(proposal.pi_firstname, ' ', proposal.pi_lastname)) AS "pi_name"
                FROM proposal
                INNER JOIN funding ON proposal.proposal_id=funding.proposal_id and proposal.redcap_repeat_instrument is null and funding.redcap_repeat_instrument is null
                INNER JOIN "PI" ON "PI".pi_firstname=proposal.pi_firstname AND "PI".pi_lastname=proposal.pi_lastname
                INNER JOIN name ON name.index=CAST(proposal.protocol_status AS VARCHAR) and name."column"='protocol_status'
                LEFT JOIN name name2 ON name2.index=CAST(proposal.tic_ric_assign_v2 AS VARCHAR) AND name2."column"='tic_ric_assign_v2'
                INNER JOIN name name3 ON name3.index=CAST(proposal.org_name AS VARCHAR) AND name3."column"='org_name';`
            db.any(query)
                .then(data => {
                    data.forEach(proposal => {
                        // console.log(proposal)
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

// /proposals/by-date
exports.byDate = (req, res) => {
    query = `SELECT DISTINCT
            CAST(proposal.proposal_id AS INT),
            proposal.short_name,
            proposal.prop_submit
        FROM proposal
        INNER JOIN name ON name.index=CAST(proposal.tic_ric_assign_v2 AS VARCHAR)
        INNER JOIN name name2 ON name2.index=CAST(proposal.tic_ric_assign_v2 AS VARCHAR) AND name2."column"='tic_ric_assign_v2'
        INNER JOIN name name3 ON name3.index=CAST(proposal.org_name AS VARCHAR) AND name3."column"='org_name'
        WHERE name."column"='protocol_status' AND name2."column"='tic_ric_assign_v2';`
    db.any(query)
        .then(data => {
            data.forEach(proposal => {
                const date = new Date(proposal.prop_submit)
                delete proposal.prop_submit
                const year = date.getFullYear()
                let month = (date.getMonth() + 0)
                if (month <= 9) month = `0${ month }`
                let day = date.getDate()
                if (day <= 9) day = `0${ day }`
                proposal.day = `${ year }-${ month }-${ day }`
            })
            dates = data.map(({ day }) => { return day })
            proposalsByDate = []
            dates.forEach(date => {
                const index = proposalsByDate.findIndex((prop) => prop.day === date)
                if (index >= 0) {
                    proposalsByDate[index].value += 1
                } else {
                    proposalsByDate.push({ day: date, value: 1})
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
    query = `SELECT DISTINCT vote.proposal_id, services_approved, vote.meeting_date
        FROM vote
        INNER JOIN service_services_approved ON vote.proposal_id=service_services_approved.proposal_id
        WHERE vote.meeting_date is not NULL order by vote.proposal_id;`
    db.any(query)
        .then(data => {
            let newData = []
            data.forEach(prop => {
                prop.proposal_id = parseInt(prop.proposal_id)
                const propIndex = newData.findIndex(q => q.proposal_id === prop.proposal_id)
                if (propIndex >= 0) {
                    newData[propIndex].services_approved.push(prop.services_approved) 
                } else {
                    newData.push({
                        proposal_id: prop.proposal_id,
                        services_approved: [prop.services_approved],
                        meeting_date: prop.meeting_date.toDateString(),
                    })
                }
            })
            newData.sort(compareIds)
            res.status(200).send(newData)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

// /proposals/submitted-services
exports.submittedServices = (req, res) => {
    query = `SELECT DISTINCT vote.proposal_id, new_service_selection, vote.meeting_date
        FROM vote
        INNER JOIN proposal_new_service_selection ON vote.proposal_id=proposal_new_service_selection.proposal_id
        WHERE vote.meeting_date is not NULL order by vote.proposal_id;`
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
            newData.sort(compareIds)
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
        WHERE name."column"='protocol_status' AND name2."column"='tic_ric_assign_v2' AND name3."column"='org_name' AND name4."column"='theraputic_area' ORDER BY proposal_id;`
    db.any(query)
        .then(data => {
            data.sort(compareIds)
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', err)
            res.status(500).send('There was an error fetching data.')
        })
}
