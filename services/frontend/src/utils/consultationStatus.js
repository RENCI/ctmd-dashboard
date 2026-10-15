// Pure helpers for the "Proposals by Consultation Status" chart. No React deps,
// so the grouping + shaping are unit-testable (consultationStatus.test.js).
//
// Proposals are rolled into five consultation-status groups — the same grouping
// the old server figure used (services/api/controllers/graphics.js). Keyed off the
// RAW proposalStatus, so callers must pass un-mutated proposals.

export const CONSULTATION_PHASES = [
  'Initial Consultations',
  'Comprehensive Consults',
  'In Full Implementation',
  'Discrete Resources',
  'Other',
]

export const consultationGroup = (status) => {
  switch (status) {
    case 'Approved for Initial Consultation':
    case 'Ready for Initial Consultation':
    case 'Initial Consult in Progress':
    case 'Initial Consult on Hold':
    case 'Initial Consult Complete: Recommend for Comprehensive Consultation':
    case 'Initial Consult Complete: Recommended for Resources':
    case 'Initial Consult Complete: No Further Support Needed':
      return 'Initial Consultations'
    case 'Recommend for Comprehensive Consultation':
    case 'Comprehensive Complete - Grant Submitted':
    case 'Comprehensive Consult in Progress':
    case 'Comprehensive Consult on Hold':
    case 'Comprehensive Consult Complete: No Further Support Needed':
    case 'Comprehensive Consult Complete: Grant Submitted (Awaiting Outcome)':
    case 'Comprehensive Consult Complete: Funding Awarded TIC/RIC Support Ongoing':
    case 'Comprehensive Consult Complete':
    case 'Comprehensive Consult Complete: Not Funded (No Further Network Support)':
    case 'Comprehensive Consult Complete: Not Funded (Resubmission pending)':
      return 'Comprehensive Consults'
    case 'Ready for Implementation':
    case 'Implementation Ongoing: Planning Phase':
    case 'Implementation Ongoing: Execution Phase':
    case 'Implementation Ongoing: Close Out Phase':
    case 'Implementation Complete':
    case 'Implementation on Hold':
    case 'Implementation: Planning Grant':
    case 'Pilot Ongoing: Planning Phase':
    case 'Pilot Ongoing: Execution Phase':
    case 'Pilot Ongoing: Close Out Phase':
    case 'Pilot Complete':
    case 'Pilot on Hold':
    case 'Demo Ongoing':
    case 'Demo Complete':
    case 'Demo on Hold':
      return 'In Full Implementation'
    case 'Approved for Resource(s)':
    case 'Approved for Resource(s) Pending Receipt of Funding':
    case 'Did Not Receive Funding No Further Network Support':
    case 'Resources Ongoing':
    case 'Resources Complete':
    case 'Resources Pending Award':
    case 'Resource(s) Complete':
    case 'No Longer Providing Resources - Declined by PI':
      return 'Discrete Resources'
    default:
      return 'Other'
  }
}

const emptyCounts = () => CONSULTATION_PHASES.reduce((o, ph) => { o[ph] = 0; return o }, {})

// Roll proposals into [{ tic, counts: { <phase>: n }, total }], one entry per TIC,
// sorted by total descending. `ticNames` seeds the set so EVERY known TIC appears
// — including ones with no proposals yet (e.g. NCATS) — rather than being dropped.
export const buildTicConsultationData = (proposals, ticNames = []) => {
  const byTic = {}
  ;(ticNames || []).forEach((name) => { if (name) byTic[name] = emptyCounts() })
  ;(proposals || []).forEach((p) => {
    const tic = p && p.assignToInstitution
    if (!tic) return
    if (!byTic[tic]) byTic[tic] = emptyCounts()
    byTic[tic][consultationGroup(p.proposalStatus)] += 1
  })
  return Object.keys(byTic)
    .map((tic) => {
      const counts = byTic[tic]
      const total = CONSULTATION_PHASES.reduce((s, ph) => s + counts[ph], 0)
      return { tic, counts, total }
    })
    .sort((a, b) => b.total - a.total)
}

// Round a max value up to a clean axis maximum.
export const niceMax = (v) => {
  if (v <= 0) return 0
  const step = v > 120 ? 20 : (v > 40 ? 10 : 5)
  return Math.ceil(v / step) * step
}
