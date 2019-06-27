const db = require('../config/database')
const stringToInteger = require('./utils').stringToInteger
const fs = require('fs')
const csv = require('csv-parser')

exports.retrieve = (req, res) => {
    const results = []
    const studyName = req.params.studyName || ''
    const metricsFile = __dirname + `/../temp/Metrics_${ studyName }.csv`
    console.log(`Retriving metrics from ${ metricsFile }...`)
    stream = fs.createReadStream(metricsFile)
    stream.on('error', error => {
        console.log('An error occurred', error)
        if (error.code === 'ENOENT') {
            const fileNotFoundMessage = `File not found for study ${ studyName }!`
            console.log(fileNotFoundMessage);
            res.status(500).send(fileNotFoundMessage)
        } else {
            res.status(500).send('An error occurred!')
        }
    })
    stream.pipe(csv())
        .on('data', data => results.push(data))
        .on('end', () => {
            res.status(200).send(results)
        })
}