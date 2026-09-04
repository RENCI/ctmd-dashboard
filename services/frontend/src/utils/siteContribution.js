// Pure helpers for the Site Contribution chart (study report). No React deps, so
// the logic is unit-testable in isolation (siteContribution.test.js).

export const num = (v) => parseInt(v || 0, 10)

// Build the donut slices + summary for a study's Site Contribution chart:
// one slice per site (by patients enrolled), plus a "Short of Goal" slice =
// max(0, enrollment target - total enrolled). Sites with 0 enrolled are dropped.
export const buildSiteContribution = (sites, goal) => {
  const slices = (Array.isArray(sites) ? sites : [])
    .map((s) => ({ id: s.siteName || `Site ${s.siteId || '?'}`, value: num(s.patientsEnrolledCount) }))
    .filter((d) => d.value > 0)
  const totalEnrolled = slices.reduce((sum, d) => sum + d.value, 0)
  const target = num(goal)
  const shortOfGoal = Math.max(0, target - totalEnrolled)
  const data = shortOfGoal > 0 ? [...slices, { id: 'Short of Goal', value: shortOfGoal }] : slices
  return { data, totalEnrolled, target, siteCount: slices.length, shortOfGoal }
}
