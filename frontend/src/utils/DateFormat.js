const monthNames = [
  "January", "February", "March",
  "April", "May", "June",
  "July", "August", "September",
  "October", "November", "December"
]

export const formatDate = (date, options = {year: 'numeric', month: 'long', day: '2-digit'}, locales='en-US' ) => {
  return date.toLocaleDateString(locales, options);
}
