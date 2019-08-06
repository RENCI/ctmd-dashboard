const db = require('../config/database')
const fs = require('fs')
const path = require('path')

const ctsasFilePath = path.join(__dirname, '/../temp/ctsas.json')

exports.list = (req, res) => {
    const ctsasFile = fs.readFileSync(ctsasFilePath)
    const ctsasJson = JSON.parse(ctsasFile)
    res.send(ctsasJson)
}
