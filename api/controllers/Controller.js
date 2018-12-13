const db = require('../config/database')

exports.runQuery = (req, res, query) => {
    db.any(query)
        .then(data => {
            console.log(`HIT: ${req.path}`)
            console.log(data)
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
        })
}