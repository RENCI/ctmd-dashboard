const db = require('../config/database')

exports.list = (req, res) => {
    query = `SELECT DISTINCT pi_firstname, pi_lastname, pi_name, pi_name_2 FROM "PI";`
    db.any(query)
        .then(pis => {
            res.status(200).send(pis)
        })
        .catch(error => {
            console.log(error)
            res.status(500).send('There was an error fetching data.')
        })
}
