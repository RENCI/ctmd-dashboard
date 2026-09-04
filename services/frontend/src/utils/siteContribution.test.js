import { buildSiteContribution } from './siteContribution'

describe('buildSiteContribution', () => {
  const sites = [
    { siteName: 'A', patientsEnrolledCount: 10 },
    { siteName: 'B', patientsEnrolledCount: 5 },
    { siteName: 'C', patientsEnrolledCount: 0 }, // dropped (0 enrolled)
  ]

  it('one slice per site with enrollment, dropping zero-enrollment sites', () => {
    const { data, siteCount } = buildSiteContribution(sites, 100)
    expect(siteCount).toBe(2)
    expect(data.filter((d) => d.id !== 'Short of Goal')).toEqual([
      { id: 'A', value: 10 },
      { id: 'B', value: 5 },
    ])
  })

  it('adds a Short of Goal slice = max(0, target - enrolled)', () => {
    const { data, shortOfGoal, totalEnrolled } = buildSiteContribution(sites, 100)
    expect(totalEnrolled).toBe(15)
    expect(shortOfGoal).toBe(85)
    expect(data.find((d) => d.id === 'Short of Goal').value).toBe(85)
  })

  it('omits Short of Goal when enrolled >= target', () => {
    const { data, shortOfGoal } = buildSiteContribution(sites, 10)
    expect(shortOfGoal).toBe(0)
    expect(data.find((d) => d.id === 'Short of Goal')).toBeUndefined()
  })

  it('handles missing / empty inputs', () => {
    expect(buildSiteContribution(null, null).data).toEqual([])
    expect(buildSiteContribution([], 50).data).toEqual([{ id: 'Short of Goal', value: 50 }])
  })

  it('falls back to "Site <id>" when siteName is missing', () => {
    const { data } = buildSiteContribution([{ siteId: 7, patientsEnrolledCount: 3 }], 0)
    expect(data[0].id).toBe('Site 7')
  })

  it('coerces string counts (as the API returns them)', () => {
    const { totalEnrolled } = buildSiteContribution([{ siteName: 'A', patientsEnrolledCount: '12' }], '0')
    expect(totalEnrolled).toBe(12)
  })
})
