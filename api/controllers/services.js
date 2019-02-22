const db = require('../config/database')

exports.approvalServices = (req, res) => {
    query = `SELECT CAST(index AS INT), id, description FROM name WHERE "column"='servicesApproved' ORDER BY index;`
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

exports.submissionServices = (req, res) => {
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
