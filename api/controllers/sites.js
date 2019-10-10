const db = require('../config/database')

exports.list = (req, res) => {
    const query = `SELECT * FROM "Sites";`
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}
