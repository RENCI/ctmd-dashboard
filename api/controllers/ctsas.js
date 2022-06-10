const db = require('../config/database')

exports.list = (req, res) => {
    const query = `SELECT * FROM "CTSAs";`
    db.any(query)
        .then(data => {
            const filteredCtsas = data
                .filter(d => parseInt(d.ctsaId))
                .map(d => ({
                    ctsaId: +d.ctsaId,
                    ctsaName: d.ctsaName
                }))
            res.status(200).send(filteredCtsas)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

