const db = require('../config/database')

const stringToArray = (str) => {
    return str.slice(1, -1).split(',').filter(el => el != '')
}

const compareIds = (p, q) => {
    return (p.proposal_id < q.proposal_id) ? -1 : 1
}

exports.list = (req, res) => {
    query = `SELECT DISTINCT
            proposal.proposal_id,
            TRIM(CONCAT(proposal.pi_firstname, ' ', proposal.pi_lastname)) AS pi_name,
            name2.description AS tic_name,
            name.description AS proposal_status
        FROM proposal
        INNER JOIN name ON name.index=CAST(proposal.tic_ric_assign_v2 as varchar)
        INNER JOIN name name2 ON name2.index=CAST(proposal.tic_ric_assign_v2 as varchar)
        WHERE name."column"='protocol_status' AND name2."column"='tic_ric_assign_v2';`
    db.any(query)
        .then(data => {
            console.log(`HIT: /proposals${ req.path }`)
            data.sort(compareIds)
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
        })
}

const camelCase = str => {
    let string = str.toLowerCase().replace(/[^A-Za-z0-9]/g, ' ').split(' ')
        .reduce((result, word) => result + capitalize(word.toLowerCase()))
    return string.charAt(0).toLowerCase() + string.slice(1)
}
const capitalize = str => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1)

exports.byStage = (req, res) => {
    let query = `SELECT description AS name FROM name WHERE "column"='protocol_status' ORDER BY index;`
    db.any(query)
        .then(stages => {
            stages.forEach(stage => { stage.count = 0 })
            query = `SELECT DISTINCT proposal.proposal_id, name.description AS proposal_status, name2.description AS tic_name,
           proposal.org_name, proposal.tic_ric_assign_v2, proposal.protocol_status, funding.anticipated_budget, funding.funding_duration,
           proposal.redcap_repeat_instrument, proposal.redcap_repeat_instance,
           TRIM(CONCAT(proposal.pi_firstname, ' ', proposal.pi_lastname)) AS "pi_name"
       FROM proposal
       INNER JOIN funding ON proposal.proposal_id=funding.proposal_id
       INNER JOIN "PI" ON "PI".pi_firstname=proposal.pi_firstname AND "PI".pi_lastname=proposal.pi_lastname
       INNER JOIN name ON name.index=CAST(proposal.protocol_status as varchar)
       INNER JOIN name name2 ON name2.index=CAST(proposal.tic_ric_assign_v2 as varchar)
       WHERE name."column"='protocol_status' AND name2."column"='tic_ric_assign_v2';`
            db.any(query)
                .then(data => {
                    console.log(`HIT: /proposals${ req.path }`)
                    data.forEach(proposal => {
                        const index = stages.findIndex(stage => stage.name === proposal.proposal_status)
                        if (index >= 0) {
                            stages[index].count += 1
                        }
                    })
                    res.status(200).send(stages)
                })
                .catch(error => {
                    console.log('ERROR:', error)
                })
        })
}

exports.approvedServices = (req, res) => {
    query = `SELECT DISTINCT vote.proposal_id, services_approved, vote.meeting_date
        FROM vote
        INNER JOIN service_services_approved ON vote.proposal_id=service_services_approved.proposal_id
        WHERE vote.meeting_date is not NULL order by vote.proposal_id;`
    db.any(query)
        .then(data => {
            console.log(`HIT: /proposals${ req.path }`)
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
        })
}

exports.submittedServices = (req, res) => {
    query = `SELECT DISTINCT vote.proposal_id, new_service_selection, vote.meeting_date
        FROM vote
        INNER JOIN proposal_new_service_selection ON vote.proposal_id=proposal_new_service_selection.proposal_id
        WHERE vote.meeting_date is not NULL order by vote.proposal_id;`
    db.any(query)
        .then(data => {
            console.log(`HIT: /proposals${ req.path }`)
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
        })
}

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
            console.log(`HIT: /proposals${ req.path }`)
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
        .catch(err => {
            console.log('ERROR:', err)
        })
}
