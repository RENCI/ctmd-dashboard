const db = require('../config/database')

exports.list = (req, res) => {
    query = `SELECT CAST(index AS INT), description FROM name WHERE "column"='org_name' ORDER BY index;`
    db.any(query)
        .then(orgs => {
            res.status(200).send(orgs)
        })
        .catch(error => {
            console.log('ERROR', error)
            res.status(500).send('There was an error fetching data.')
        })
}
