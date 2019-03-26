const db = require('../config/database')

exports.post = (req, res) => {
    res.status(200).send('Post site report')
}

exports.list = (req, res) => {
    query = 'SELECT *, CAST("ProposalID" AS INT) from "SiteInformation";'
    db.any(query)
        .then(data => {
            console.log(`Returning site list`)
            data.sort((p, q) => p.ProposalID <= q.ProposalID)
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('Error', error)
            res.status(500).send('Error', error)
        })
}

exports.siteReport = (req, res) => {
    res.status(200).send('Get site report')
}
