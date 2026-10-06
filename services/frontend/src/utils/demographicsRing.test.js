import {
  num, buildRingData, ringTotals, lighten, darken, polar, arcPath, RACES, ETHNICITIES,
} from './demographicsRing'

// A minimal EnrollmentDemographics-shaped row (subset of columns).
const row = {
  actualWhiteFemale: '410', actualWhiteMale: '380',
  actualBlackFemale: 120, actualBlackMale: 110,
  actualAIANFemale: 20, actualAIANMale: 18,
  actualAsianFemale: 95, actualAsianMale: 85,
  actualNHPIFemale: 19, actualNHPIMale: 19,
  actualHispanicFemale: 120, actualHispanicMale: 110,
  actualNonHispanicFemale: 544, actualNonHispanicMale: 502,
  plannedWhiteFemale: 385, plannedWhiteMale: 355,
}

describe('num', () => {
  it('parses strings and defaults blanks to 0', () => {
    expect(num('410')).toBe(410)
    expect(num(null)).toBe(0)
    expect(num(undefined)).toBe(0)
    expect(num('')).toBe(0)
  })
})

describe('buildRingData', () => {
  it('returns one slice per race with female/male from the matching columns', () => {
    const data = buildRingData(row, 'actual', 'race')
    expect(data.map((d) => d.cat)).toEqual(RACES)
    const white = data.find((d) => d.cat === 'White')
    expect(white).toEqual({ cat: 'White', f: 410, m: 380 })
  })

  it('relabels ethnicity stems for display', () => {
    const data = buildRingData(row, 'actual', 'ethnicity')
    expect(data.map((d) => d.cat)).toEqual(['Hispanic', 'Non-Hispanic'])
    expect(data[1]).toEqual({ cat: 'Non-Hispanic', f: 544, m: 502 })
    expect(ETHNICITIES).toEqual(['Hispanic', 'NonHispanic'])
  })

  it('reads the planned columns when kind=planned', () => {
    const data = buildRingData(row, 'planned', 'race')
    expect(data.find((d) => d.cat === 'White')).toEqual({ cat: 'White', f: 385, m: 355 })
  })

  it('collapses to a two-slice Female/Male breakdown on the sex axis', () => {
    const data = buildRingData(row, 'actual', 'sex')
    expect(data).toEqual([{ cat: 'Female', f: 664, m: 0 }, { cat: 'Male', f: 0, m: 612 }])
    expect(ringTotals(data)).toEqual({ f: 664, m: 612, total: 1276 })
  })

  it('returns [] for a missing row', () => {
    expect(buildRingData(null, 'actual', 'race')).toEqual([])
    expect(buildRingData(undefined, 'actual', 'ethnicity')).toEqual([])
  })

  it('treats absent cells as 0', () => {
    const data = buildRingData({}, 'actual', 'race')
    expect(data.every((d) => d.f === 0 && d.m === 0)).toBe(true)
  })
})

describe('ringTotals', () => {
  it('sums female, male and grand total', () => {
    const data = buildRingData(row, 'actual', 'race')
    expect(ringTotals(data)).toEqual({ f: 664, m: 612, total: 1276 })
  })
  it('reconciles across axes (same people, two breakdowns)', () => {
    const race = ringTotals(buildRingData(row, 'actual', 'race'))
    const eth = ringTotals(buildRingData(row, 'actual', 'ethnicity'))
    expect(eth.total).toBe(race.total)
    expect(eth.f).toBe(race.f)
    expect(eth.m).toBe(race.m)
  })
})

describe('lighten / darken', () => {
  it('hit white and black at full amount', () => {
    expect(lighten('#336699', 1)).toBe('#ffffff')
    expect(darken('#336699', 1)).toBe('#000000')
  })
  it('return the colour unchanged at amount 0', () => {
    expect(lighten('#66c2a5', 0)).toBe('#66c2a5')
    expect(darken('#66c2a5', 0)).toBe('#66c2a5')
  })
  it('produce valid 7-char hex', () => {
    expect(lighten('#66c2a5', 0.18)).toMatch(/^#[0-9a-f]{6}$/)
    expect(darken('#66c2a5', 0.2)).toMatch(/^#[0-9a-f]{6}$/)
  })
})

describe('polar', () => {
  it('places 0° at the top (12 o’clock)', () => {
    const [x, y] = polar(160, 160, 100, 0)
    expect(Math.round(x)).toBe(160)
    expect(Math.round(y)).toBe(60)
  })
  it('places 90° to the right (3 o’clock)', () => {
    const [x, y] = polar(160, 160, 100, 90)
    expect(Math.round(x)).toBe(260)
    expect(Math.round(y)).toBe(160)
  })
})

describe('arcPath', () => {
  it('starts with a move command and closes the path', () => {
    const d = arcPath(160, 160, 86, 150, 0, 90)
    expect(d.startsWith('M')).toBe(true)
    expect(d.trim().endsWith('Z')).toBe(true)
  })
  it('sets the large-arc flag for spans over 180°', () => {
    expect(arcPath(160, 160, 86, 150, 0, 200)).toContain(`150 150 0 1 1`)
    expect(arcPath(160, 160, 86, 150, 0, 90)).toContain(`150 150 0 0 1`)
  })
  it('guards a full-circle span so it still renders', () => {
    const d = arcPath(160, 160, 86, 150, 0, 360)
    expect(d.startsWith('M')).toBe(true)
  })
})
