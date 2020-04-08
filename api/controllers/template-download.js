const fs = require('fs')

const templates = {
    'ctsas': 'ctsas-template.csv',
    'enrollment': 'enrollment-template.csv',
    'sites': 'sites-template.csv',
    'study-profile': 'study-profiles-template.csv',
}

exports.download = (req, res) => {
    const { tableName } = req.params
    const file = `${ __dirname }/../templates/${ templates[tableName] }`
    if (!Object.keys(templates).includes(tableName) || !fs.existsSync(file)) {
        console.error(`File could not be found`)
        res.status(404).send({ message: 'File could not be found' })
        return
    }
    // const file = `${ __dirname }/../templates/${ templates[tableName] }`
    console.log(`Sending file ${ file }.`)
    res.status(200).download(file)
}
