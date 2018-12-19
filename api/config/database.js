const pgp = require('pg-promise')(/*options*/)

const connection = {
    host: 'db',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'postgres',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'secret',
}
module.exports = pgp(connection)