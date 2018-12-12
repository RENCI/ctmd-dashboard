const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const pgp = require('pg-promise')(/*options*/)

const PORT = 3030

app.listen(PORT, () => {
    console.log(`The API is listening on port ${PORT}.`)
})

// Database Connection
const connection = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
}
var db = pgp(connection)

// Base Route
app.get('/', (req, res) => {
    console.log('Got a visitor!')
    res.send('Welcome')
})

let query = ''
// Services Approved in First Meeting
query = 'SELECT service.proposal_id, service.services_approved, vote.meeting_date, funding.funding FROM service  INNER JOIN vote ON service.proposal_id=vote.proposal_id INNER JOIN funding ON funding.proposal_id=vote.proposal_id WHERE vote.meeting_date is not NULL ORDER BY vote.meeting_date'
// Services Approved in Second Meeting
// query = 'SELECT service.proposal_id, service.services_approved, vote.meeting_date, funding.funding FROM service  INNER JOIN vote ON service.proposal_id=vote.proposal_id INNER JOIN funding ON funding.proposal_id=vote.proposal_id WHERE vote.meeting_date_2 is not NULL ORDER BY vote.meeting_date_2;'
// By Assigned Institution
// query = 'SELECT proposal.proposal_id, service.services_approved, proposal.tic_ric_assign_v2, funding.funding FROM proposal INNER JOIN service ON proposal.proposal_id=service.proposal_id INNER JOIN funding ON funding.proposal_id=service.proposal_id ORDER BY proposal.tic_ric_assign_v2;'

db.any(query)
    .then(function (data) {
        console.log('DATA:', data)
    })
    .catch(function (error) {
        console.log('ERROR:', error)
    })

