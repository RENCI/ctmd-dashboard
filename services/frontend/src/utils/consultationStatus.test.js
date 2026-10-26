import {
  consultationGroup, buildTicConsultationData, niceMax, CONSULTATION_PHASES,
} from './consultationStatus'

describe('consultationGroup', () => {
  it('maps statuses to the five consultation groups', () => {
    expect(consultationGroup('Ready for Initial Consultation')).toBe('Initial Consultations')
    expect(consultationGroup('Comprehensive Consult in Progress')).toBe('Comprehensive Consults')
    expect(consultationGroup('Pilot Complete')).toBe('In Full Implementation')
    expect(consultationGroup('Resources Ongoing')).toBe('Discrete Resources')
  })
  it('falls back to Other for unknown / blank statuses', () => {
    expect(consultationGroup('Something New')).toBe('Other')
    expect(consultationGroup(undefined)).toBe('Other')
    expect(consultationGroup(null)).toBe('Other')
  })
})

describe('buildTicConsultationData', () => {
  const proposals = [
    { assignToInstitution: 'A TIC', proposalStatus: 'Ready for Initial Consultation' },
    { assignToInstitution: 'A TIC', proposalStatus: 'Resources Ongoing' },
    { assignToInstitution: 'A TIC', proposalStatus: 'Resources Ongoing' },
    { assignToInstitution: 'B TIC', proposalStatus: 'Pilot Complete' },
    { assignToInstitution: null, proposalStatus: 'Ready for Initial Consultation' }, // unassigned → dropped
  ]

  it('rolls proposals into per-TIC phase counts with totals', () => {
    const data = buildTicConsultationData(proposals, ['A TIC', 'B TIC'])
    const a = data.find((d) => d.tic === 'A TIC')
    expect(a.counts['Initial Consultations']).toBe(1)
    expect(a.counts['Discrete Resources']).toBe(2)
    expect(a.total).toBe(3)
    expect(a.counts).toHaveProperty('Other', 0)
  })

  it('sorts by total descending and drops seeded TICs with no proposals (e.g. NCATS)', () => {
    const data = buildTicConsultationData(proposals, ['A TIC', 'B TIC', 'NCATS'])
    expect(data.map((d) => d.tic)).toEqual(['A TIC', 'B TIC'])
    expect(data.find((d) => d.tic === 'NCATS')).toBeUndefined()
  })

  it('does not read a mutated/display status (unknown maps to Other, not a crash)', () => {
    const data = buildTicConsultationData(
      [{ assignToInstitution: 'A TIC', proposalStatus: 'Initial Consult Ongoing' }], ['A TIC'])
    expect(data[0].counts['Other']).toBe(1)
  })

  it('every entry carries all five phases', () => {
    const data = buildTicConsultationData(proposals, ['A TIC'])
    CONSULTATION_PHASES.forEach((ph) => expect(data[0].counts).toHaveProperty(ph))
  })

  it('handles empty / missing input', () => {
    expect(buildTicConsultationData(null, null)).toEqual([])
    expect(buildTicConsultationData([], [])).toEqual([])
  })
})

describe('niceMax', () => {
  it('rounds up to a clean axis maximum', () => {
    expect(niceMax(161)).toBe(180)
    expect(niceMax(82)).toBe(90)
    expect(niceMax(3)).toBe(5)
    expect(niceMax(0)).toBe(0)
  })
})
