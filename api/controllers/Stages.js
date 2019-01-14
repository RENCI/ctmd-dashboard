const db = require('../config/database')

exports.list = (req, res) => {
    query = `SELECT CAST(index as INTEGER), description
        FROM name
        WHERE "column"='protocol_status'
        ORDER BY index;`
    db.any(query)
        .then(stages => {
            res.status(200).send(stages)
        })
        .catch(err => {
            console.log(err)
            res.status(500).send('no data')
        })
}
