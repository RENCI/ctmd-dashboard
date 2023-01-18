const db = require('../config/database')
const {ParameterizedQuery: PQ} = require("pg-promise");

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



exports.removeCTSA = (req, res) => {
    const body = req.body
    const ctsaId = body.ctsaId
    const move1 = new PQ({
        text: `INSERT into removeditems (created, tablename, item)
                                         SELECT current_timestamp, 'CTSAs',  to_jsonb(rows) FROM
                                            (select * from "CTSAs" as ss where ss."ctsaId"=$1) rows;`,
        values: [ctsaId]
    })

    const del1 = new PQ({
        text: `DELETE from "CTSAs" as t where t."ctsaId" = $1;`,
        values: [ctsaId]
    })

    let sites = 0

    let q = db.any(new PQ({text: 'SELECT COUNT("ctsaId") FROM "Sites" where "ctsaId"=$1;', values:[body.ctsaId]}))
        .then(data => sites = +data[0].count)
        .then(d => {
            if(sites < 1) {
                db.any(move1)
                    .then(r=> db.any(del1)
                        .then(r => res.status(200).send('OK')))
            }
            else {
                res.status(200).send('NOT REMOVED')
            }
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })

}


