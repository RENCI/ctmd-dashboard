import { buildStatusMatrix, UNASSIGNED } from './statusMatrix'

const P = (assignToInstitution, proposalStatus) => ({ assignToInstitution, proposalStatus })

describe('buildStatusMatrix', () => {
  const proposals = [
    P('A TIC', 'Initial Consult in Progress'),
    P('A TIC', 'Initial Consult in Progress'),
    P('A TIC', 'Resources Complete'),
    P('B TIC', 'Resources Complete'),
    P(null, 'Pilot Complete'),              // no TIC -> Unassigned
    P('Unknown TIC', 'Pilot Complete'),     // TIC not in list -> Unassigned
  ]
  const tics = ['A TIC', 'B TIC']

  it('builds TIC columns from ticNames plus a trailing Unassigned column', () => {
    const { cols } = buildStatusMatrix(proposals, tics)
    expect(cols).toEqual(['A TIC', 'B TIC', UNASSIGNED])
  })

  it('rows are only the statuses present in the data (dynamic)', () => {
    const { statuses } = buildStatusMatrix(proposals, tics)
    expect(statuses.map((s) => s.status).sort()).toEqual(
      ['Initial Consult in Progress', 'Pilot Complete', 'Resources Complete'])
  })

  it('picks up a brand-new status automatically', () => {
    const { statuses } = buildStatusMatrix([...proposals, P('A TIC', 'Some Brand New Status')], tics)
    expect(statuses.some((s) => s.status === 'Some Brand New Status')).toBe(true)
  })

  it('counts per cell and buckets missing/unknown TICs into Unassigned', () => {
    const { statuses } = buildStatusMatrix(proposals, tics)
    const icp = statuses.find((s) => s.status === 'Initial Consult in Progress')
    expect(icp.counts['A TIC']).toBe(2)
    expect(icp.total).toBe(2)
    const pilot = statuses.find((s) => s.status === 'Pilot Complete')
    expect(pilot.counts[UNASSIGNED]).toBe(2) // null TIC + unknown TIC
  })

  it('computes column totals, grand total and the max cell', () => {
    const m = buildStatusMatrix(proposals, tics)
    expect(m.colTotals['A TIC']).toBe(3)
    expect(m.colTotals['B TIC']).toBe(1)
    expect(m.colTotals[UNASSIGNED]).toBe(2)
    expect(m.grandTotal).toBe(6)
    expect(m.max).toBe(2)
  })

  it('sorts statuses by total descending', () => {
    const { statuses } = buildStatusMatrix(proposals, tics)
    const totals = statuses.map((s) => s.total)
    expect(totals).toEqual([...totals].sort((a, b) => b - a))
  })

  it('handles empty / missing input', () => {
    expect(buildStatusMatrix(null, null)).toEqual({ statuses: [], cols: [UNASSIGNED], colTotals: { [UNASSIGNED]: 0 }, grandTotal: 0, max: 0 })
  })
})
