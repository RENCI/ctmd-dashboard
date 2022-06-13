const db = require('../config/database')

exports.list = (req, res) => {
    const query = `SELECT * FROM "Sites";`
    db.any(query)
        .then(data => {
            const filteredSites = data
                .filter(d => parseInt(d.siteId) && parseInt(d.ctsaId))
                .map(d => ({
                    siteId: +d.siteId,
                    ctsaId: +d.ctsaId,
                    siteName: d.siteName
                }))
            res.status(200).send(filteredSites)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}
