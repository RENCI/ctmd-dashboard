const db = require('../config/database')

exports.list = (req, res) => {
    query = `SELECT CASE name.description
        WHEN 'Recruitment & Retention Plan' THEN 'Recruitment Plan'
        WHEN 'Single IRB' THEN 'Operationalize Single IRB'
        WHEN 'Standard Agreements' THEN 'Operationalize Standard Agreements'
        ELSE name.description END description
    FROM name WHERE "column"='serviceSelection'
    ORDER BY index;
    `
    db.any(query)
        .then(resources => {
            const resourcesArray = [...new Set(resources.map(({ description }) => description))]
            res.status(200).send(resourcesArray)
        })
        .catch(error => {
            console.log(error)
            res.status(500).send('There was an error fetching data.')
        })
}

exports.approvedResources = (req, res) => {
    query = `SELECT CAST(index AS INT), id, description FROM name WHERE "column"='servicesApproved' ORDER BY index;`
    db.any(query)
        .then(resources => {
            resources.forEach(service => {
                service.index = parseInt(service.index)
            })
            res.status(200).send(resources)
        })
        .catch(error => {
            console.log(error)
            res.status(500).send('There was an error fetching data.')
        })
}

exports.requestedResources = (req, res) => {
    query = `SELECT CAST(index AS INT), id, description FROM name WHERE "column"='serviceSelection' ORDER BY index;`
    db.any(query)
        .then(services => {
            services.forEach(service => {
                service.index = parseInt(service.index)
            })
            res.status(200).send(services)
        })
        .catch(error => {
            console.log(error)
            res.status(500).send('There was an error fetching data.')
        })
}
