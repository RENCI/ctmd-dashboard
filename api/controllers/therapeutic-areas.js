const db = require('../config/database')

exports.list = (req, res) => {
    query = `SELECT CAST(index AS INT), description FROM name WHERE "column"='theraputic_area' ORDER BY index;`
    db.any(query)
        .then(areas => {
            res.status(200).send(areas)
        })
        .catch(error => {
            console.log('ERROR', error)
            res.status(500).send('There was an error fetching data.')
        })
}
