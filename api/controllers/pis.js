const db = require('../config/database')

exports.list = (req, res) => {
    query = `SELECT DISTINCT "submitterFirstName", "submitterLastName" FROM "Submitter";`
    db.any(query)
        .then(pis => {
            res.status(200).send(pis)
        })
        .catch(error => {
            console.log(error)
            res.status(500).send('There was an error fetching data.')
        })
}
