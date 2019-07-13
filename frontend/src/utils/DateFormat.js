const monthNames = [
  "January", "February", "March",
  "April", "May", "June",
  "July", "August", "September",
  "October", "November", "December"
]

export const formatDate = date => {
  var day = date.getDate()
  var monthIndex = date.getMonth()
  var year = date.getFullYear()

  return `${ monthNames[monthIndex] } ${ day }, ${ year }`
}
