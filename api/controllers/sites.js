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

    let move1 = null
    let del1 = null

    if(body.siteNumber === null)
    {
        move1 = new PQ({
            text: `INSERT into removeditems (created, tablename, item)
                                             SELECT current_timestamp, 'Sites',  to_jsonb(rows) FROM
                                                (select * from "Sites" as s where s."ctsaId"=$1 and s."siteId"=$2  and s."siteName"=$3) rows;`,
            values: [body.ctsaId, body.siteId, body.siteName]
        })

        del1 = new PQ({
            text: `DELETE from "Sites" as s where s."ctsaId" = $1 and s."siteId"=$2  and s."siteName"=$3;`,
            values:  [body.ctsaId, body.siteId, body.siteName]
        })
    }
    else {
        move1 = new PQ({
            text: `INSERT into removeditems (created, tablename, item)
                                         SELECT current_timestamp, 'StudySites',  to_jsonb(rows) FROM 
                                            (select * from "StudySites" as ss where ss."ctsaId"=$1 and ss."siteId"=$2 and ss."siteNumber"=$3) rows;`,
            values: [body.ctsaId, body.siteId, body.siteNumber]
        })

        del1 = new PQ({
            text: `DELETE from "StudySites" as ss where ss."ctsaId" = $1 and ss."siteId"=$2  and ss."siteNumber"=$3;`,
            values: [body.ctsaId, body.siteId, body.siteNumber]
        })

    }

    const r = db.any(move1)
        .then(r=> db.any(del1)
            .then(r => res.status(200).send('OK'))

            .catch(error => {
                console.log('ERROR:', error)
                res.status(500).send('There was an error fetching data.')
            }))
    Promise.all([r])

}


