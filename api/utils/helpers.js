// Helper Functions
///////////////////

// Parse array-like string returned by Postgres into a real array
exports.stringToArray = (str) => str.slice(1, -1).split(',').filter(el => el != '')
// Helper function to sort proposals by proposal_id
exports.compareIds = (p, q) => (p.proposal_id < q.proposal_id) ? -1 : 1
// Convert string to CamelCase
exports.camelCase = str => {
    let string = str.toLowerCase().replace(/[^A-Za-z0-9]/g, ' ').split(' ')
        .reduce((result, word) => result + capitalize(word.toLowerCase()))
    return string.charAt(0).toLowerCase() + string.slice(1)
}
const capitalize = str => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1)

