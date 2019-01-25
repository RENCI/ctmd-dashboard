const db = require('../config/database')

exports.approvalServices = (req, res) => {
    query = `SELECT index, id, description FROM name WHERE "column"='services_approved' ORDER BY index;`
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
    query = `SELECT index, id, description FROM name WHERE "column"='new_service_selection' ORDER BY index;`
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