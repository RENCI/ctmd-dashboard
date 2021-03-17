// Helper Functions
///////////////////
const fs = require('fs')

// Parse array-like string returned by Postgres into a real array
exports.stringToArray = (str) =>
  str
    .slice(1, -1)
    .split(',')
    .filter((el) => el != '')
// Helper function to sort proposals by proposal_id
exports.compareIds = (p, q) => (p.proposal_id < q.proposal_id ? -1 : 1)
// Convert string to CamelCase
exports.camelCase = (str) => {
  let string = str
    .toLowerCase()
    .replace(/[^A-Za-z0-9]/g, ' ')
    .split(' ')
    .reduce((result, word) => result + capitalize(word.toLowerCase()))
  return string.charAt(0).toLowerCase() + string.slice(1)
}
const capitalize = (str) => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1)

exports.getHealUsers = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8')
    return data.split('\n')
  } catch (err) {
    console.error(err)
  }
}

exports.checkIfIsHealUser = (req, healUsers) => {
  if (!req.session.auth_info) {
    return { statusCode: 403, data: { data: 'not authenticated' } }
  } else {
    const isHealUser = healUsers.includes(req.session.auth_info.email)
    const statusCode = isHealUser ? 200 : 403
    return { statusCode: statusCode, data: { isHealUser: isHealUser } }
  }
}
