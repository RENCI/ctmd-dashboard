import { invalidDisplay } from './invalidDisplay'

export const dayCount = (startDate, endDate) => {
  if (startDate && endDate) {
    const num = Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
    return `${ num } day${ num === 1 ? '' : 's' }`
  } else {
      return invalidDisplay
  }
}