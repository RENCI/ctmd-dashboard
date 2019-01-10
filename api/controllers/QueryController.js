const db = require('../config/database')

exports.runQuery = (req, res, query) => {
    db.any(query)
        .then(data => {
            console.log(`HIT: ${req.path}`)
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
        })
}