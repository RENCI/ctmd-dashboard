const db = require('../config/database')

const randomString = (length = 8) => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let returnString = [...Array(length).keys()].map(
        i => alphabet.charAt(Math.floor(Math.random() * alphabet.length))
    ).join('')
    return returnString
}

exports.post = (req, res) => {
    const newMetric = req.body
    
    // Do any necessary data massaging here
   
    // Log pre-insert
    
    console.log(newMetric)
    
    // Check if study metrics already exist in database & overwrite - or just add new entry regardless
    
    // Define INSERT query
    
    const query = 'INSERT INTO "UtahRecommendation"(...) VALUES($1, $2, ...)'
    
    // Define array of values to be passed in the above query

    const values = [newMetric.proposalID, newMetric.network, ]
    
    // Execute query: https://github.com/vitaly-t/pg-promise/wiki/Learn-by-Example
    
    // db.one(query, values)
    //     .then(data => console.log(data))
    //     .then(error => console.log('Error', error))
    res.send('Success!')
}
