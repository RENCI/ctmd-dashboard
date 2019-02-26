const db = require('../config/database')

exports.list = (req, res) => {
    query = `SELECT CAST(index AS INT), description AS name FROM name WHERE "column"='assignToInstitution' ORDER BY index;`
    db.any(query)
        .then(tics => {
            res.status(200).send(tics)
        })
        .catch(error => {
            console.log('ERROR', error)
            res.status(500).send('There was an error fetching data.')
        })
}
