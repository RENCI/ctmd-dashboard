import { invalidDisplay } from './invalidDisplay'

export const displayRatio = (a, b, precision = 2) => {
  a = parseInt(a)
  b = parseInt(b)
  if ( !a || !b ) {
    return invalidDisplay
  }
  if (a === 0) {
    if (b === 0) return invalidDisplay
    return `0% (${ a }/${ b })`
  }
  return b !== 0
    ? `${ (100 * a/b).toFixed(precision) }% (${ a }/${ b })`
    : `N/A`
}