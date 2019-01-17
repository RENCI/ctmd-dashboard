const db = require('../config/database')

exports.getOne = (req, res) => {
    query = `SELECT * FROM proposal WHERE proposal_id=${ req.params.id };`
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('Error:', error)
            res.status(500).send('Error', error)
        })
}
