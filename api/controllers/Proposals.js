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
        .catch(error => { console.log('ERROR:', error) .status(500).send('Error', error)
        })
}

// /proposals
exports.list = (req, res) => {
    query = `SELECT DISTINCT
            CAST(proposal.proposal_id AS INT),
            TRIM(CONCAT(proposal.pi_firstname, ' ', proposal.pi_lastname)) AS pi_name,
            proposal.prop_submit,
            name.description AS proposal_status,
            name2.description AS tic_name
        FROM proposal
        INNER JOIN name ON name.index=CAST(proposal.tic_ric_assign_v2 as varchar)
        INNER JOIN name name2 ON name2.index=CAST(proposal.tic_ric_assign_v2 as varchar)
        WHERE name."column"='protocol_status' AND name2."column"='tic_ric_assign_v2';`
    db.any(query)
        .then(data => {
            data.forEach(proposal => {
                proposal.submission_date = proposal.prop_submit.toDateString()
                delete proposal.prop_submit
            })
            data.sort(compareIds)
            res.status(200).send(data)
        })
        .catch(error => { console.log('ERROR:', error) })
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
                    name.description AS proposal_status,
                    name2.description AS tic_name,
                    CAST(proposal.org_name AS INT),
                    proposal.tic_ric_assign_v2,
                    CAST(proposal.protocol_status AS INT),
                    funding.anticipated_budget, funding.funding_duration,
                    proposal.redcap_repeat_instrument, proposal.redcap_repeat_instance,
                    TRIM(CONCAT(proposal.pi_firstname, ' ', proposal.pi_lastname)) AS "pi_name"
                FROM proposal
                INNER JOIN funding ON proposal.proposal_id=funding.proposal_id and proposal.redcap_repeat_instrument is null and funding.redcap_repeat_instrument is null
                INNER JOIN "PI" ON "PI".pi_firstname=proposal.pi_firstname AND "PI".pi_lastname=proposal.pi_lastname
                INNER JOIN name ON name.index=CAST(proposal.protocol_status as varchar) and name."column"='protocol_status'
                LEFT JOIN name name2 ON name2.index=CAST(proposal.tic_ric_assign_v2 as varchar) AND name2."column"='tic_ric_assign_v2';`
            db.any(query)
                .then(data => {
                    data.forEach(proposal => {
                        const index = stages.findIndex(stage => stage.name === proposal.proposal_status)
                        if (index >= 0) stages[index].proposals.push(proposal)
                    })
                    res.status(200).send(stages)
                })
                .catch(error => { console.log('ERROR:', error) })
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
                    name.description AS proposal_status, name2.description AS tic_name,
                    CAST(proposal.org_name AS INT),
                    proposal.tic_ric_assign_v2,
                    CAST(proposal.org_name AS INT),
                    proposal.protocol_status, funding.anticipated_budget, funding.funding_duration,
                    proposal.redcap_repeat_instrument, proposal.redcap_repeat_instance,
                    TRIM(CONCAT(proposal.pi_firstname, ' ', proposal.pi_lastname)) AS "pi_name"
                FROM proposal
                INNER JOIN funding ON proposal.proposal_id=funding.proposal_id and proposal.redcap_repeat_instrument is null and funding.redcap_repeat_instrument is null
                INNER JOIN "PI" ON "PI".pi_firstname=proposal.pi_firstname AND "PI".pi_lastname=proposal.pi_lastname
                INNER JOIN name ON name.index=CAST(proposal.protocol_status as varchar) and name."column"='protocol_status'
                LEFT JOIN name name2 ON name2.index=CAST(proposal.tic_ric_assign_v2 as varchar) AND name2."column"='tic_ric_assign_v2';`
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
                .catch(error => { console.log('ERROR:', error) })
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
        .catch(error => { console.log('ERROR:', error) })
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
        .catch(error => { console.log('ERROR:', error) })
}

// /proposals/network
exports.proposalsNetwork = (req, res) => {
    query = `SELECT DISTINCT proposal.proposal_id, name.description AS proposal_status, name2.description AS tic_name,
            proposal.org_name, proposal.tic_ric_assign_v2, proposal.protocol_status, funding.anticipated_budget, funding.funding_duration,
            proposal.redcap_repeat_instrument, proposal.redcap_repeat_instance,
            TRIM(CONCAT(proposal.pi_firstname, ' ', proposal.pi_lastname)) AS pi_name
        FROM proposal
        INNER JOIN funding ON proposal.proposal_id=funding.proposal_id
        INNER JOIN "PI" ON "PI".pi_firstname=proposal.pi_firstname AND "PI".pi_lastname=proposal.pi_lastname
        INNER JOIN name ON name.index=CAST(proposal.protocol_status as varchar) 
        INNER JOIN name name2 ON name2.index=CAST(proposal.tic_ric_assign_v2 as varchar)
        WHERE name."column"='protocol_status' AND name2."column"='tic_ric_assign_v2';`
    db.any(query)
        .then(data => {
            data.forEach(prop => {
                delete prop.tic_ric_assign_v2
                delete prop.redcap_repeat_instrument
                delete prop.redcap_repeat_instance
                prop.proposal_id = parseInt(prop.proposal_id)
                prop.org_name = parseInt(prop.org_name)
                prop.protocol_status = parseInt(prop.protocol_status)
            })
            data.sort(compareIds)
            res.status(200).send(data)
        })
        .catch(error => { console.log('ERROR:', err) })
}
