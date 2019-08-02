const db = require('../config/database')
const stringToInteger = require('./utils').stringToInteger
const fs = require('fs')
const csv = require('csv-parser')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'temp')
    },
    filename: (req, file, cb) => {
        cb(null, req.params.id + '.json')
    }
})
const upload = multer({ storage: storage }).array('file')

//

exports.upload = (req, res) => {
    const proposalID = req.params.id
    if (proposalID) {
        upload(req, res, error => {
            if (error instanceof multer.MulterError) {
                return res.status(500).json(error)
            } else if (error) {
                return res.status(500).json(error)
            }
            return res.status(200).send(req.file)
        })
    } else {
        return 'Invalid proposal ID'
    }
}

exports.get = (req, res) => {
    const id = req.query.proposalID
    console.log(`Retrieving study-metrics for proposal ${ id }`)
    query = 'SELECT * from "UtahRecommendation" where "ProposalID"=$1'
    db.oneOrNone(query, id)
        .then(data => {
            if (data) {
                console.log(`Metrics found for proposal ${ id }`)
                res.status(200).send(data)
            } else {
                console.log(`No metrics found for proposal ${ id }`)
                res.status(200).send()
            }
        })
        .catch(error => {
            console.log('Error', error)
            res.status(500).send('Error', error)
        })
}

exports.profile = (req, res) => {
    console.log(req.params)
    const studyProfileFile = __dirname + `/../temp/${ req.params.id }.json`
    console.log(`Retriving study profile...`)
    var contents = fs.readFileSync(studyProfileFile)
    var jsonContent = JSON.parse(contents)
    console.log(jsonContent)
    res.send(jsonContent)
}