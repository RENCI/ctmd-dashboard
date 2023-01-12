const db = require('../config/database')
const {ParameterizedQuery: PQ} = require('pg-promise');

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

exports.removeSite = (req, res) => {
    const body = req.body
    const move = new PQ({text: `INSERT into removeditems (created, tablename, item)
                                         SELECT current_timestamp, 'StudySites',  to_jsonb(rows) FROM 
                                            (select * from "StudySites" as ss where ss."ProposalID" = $1 and "siteId"=$2) rows;`,
                                values: [body.proposalID, body.siteId]})
    const del = new PQ({text: `DELETE from "StudySites" as ss where ss."ProposalID" = $1 and ss."siteId"=$2;`,
                            values: [body.proposalID, body.siteId]})

    db.multi(move)
        .then(() => {
            db.none(del)
            res.status(200).send('OK')
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })


}
