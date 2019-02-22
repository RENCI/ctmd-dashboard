const db = require('../config/database')

exports.list = (req, res) => {
    query = `SELECT CAST(index AS INT), description FROM name WHERE "column"='proposalStatus' ORDER BY index;`
    db.any(query)
        .then(statuses => {
            res.status(200).send(statuses)
        })
        .catch(error => {
            console.log(error)
            res.status(500).send('There was an error fetching data.')
        })
}
