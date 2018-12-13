const pgp = require('pg-promise')(/*options*/)

const connection = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
}
module.exports = pgp(connection)