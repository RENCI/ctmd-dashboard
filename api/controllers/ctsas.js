const db = require('../config/database')
const fs = require('fs')
const path = require('path')

const ctsasFilePath = path.join(__dirname, '/../temp/ctsas.json')

exports.list = (req, res) => {
    const query = `SELECT * FROM "CTSAs";`
    db.any(query)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(error => {
            console.log('ERROR:', error)
            res.status(500).send('There was an error fetching data.')
        })
}

exports.upload = (req, res) => {
    res.status(200).send('Upload CTSAs, OK!')
}
