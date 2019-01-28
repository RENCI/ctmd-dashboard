const db = require('../config/database')

exports.list = (req, res) => {
    query = `SELECT CAST(index as INTEGER), description FROM name WHERE "column"='protocol_status' ORDER BY index;`
    db.any(query)
        .then(stages => {
            res.status(200).send(stages)
        })
        .catch(error => {
            console.log(error)
            res.status(500).send('There was an error fetching data.')
        })
}
