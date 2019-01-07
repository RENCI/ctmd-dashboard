const db = require('../config/database')

String.prototype.toArray = (str) => {
    return str.slice(1, -1)
        .split(',')
        .filter(el => el != '')
}

exports.proposals = (req, res) => {
    query = `SELECT DISTINCT service.proposal_id, service.services_approved, vote.meeting_date, funding.funding FROM service
        INNER JOIN vote ON service.proposal_id=vote.proposal_id
        INNER JOIN funding ON funding.proposal_id=vote.proposal_id
        WHERE vote.meeting_date is not NULL;`
    db.any(query)
        .then(data => {
            console.log(`HIT: ${req.path}`)
            data.forEach(prop => {
                prop.proposal_id = parseInt(prop.proposal_id)
                prop.services_approved = prop.services_approved.toArray()
                prop.meeting_date = 'adasd'
            })
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
        })
}

exports.runQuery = (req, res, query) => {
    db.any(query)
        .then(data => {
            console.log(`HIT: ${req.path}`)
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
        })
}