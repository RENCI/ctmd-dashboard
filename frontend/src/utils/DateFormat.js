export const formatDate = (date, options = { year: 'numeric', month: 'long', day: '2-digit', timeZone: 'UTC' }, locales = 'en-US') => {
  return date.toLocaleDateString(locales, options)
}
