// Pure helpers for the "Proposals by Application Status" matrix (home dashboard).
// No React deps -> unit-testable (statusMatrix.test.js).
//
// The matrix is built ENTIRELY from the data: rows are whatever statuses actually
// appear on proposals (so a brand-new REDCap status is picked up automatically),
// columns are the known TICs plus an "Unassigned" bucket for proposals with no TIC.

export const UNASSIGNED = 'Unassigned'

// Build { statuses: [{ status, counts: {tic:n}, total }], cols, colTotals, grandTotal, max }.
// `ticNames` seeds and orders the TIC columns; Unassigned is always appended last.
export const buildStatusMatrix = (proposals, ticNames = []) => {
  const known = new Set((ticNames || []).filter(Boolean))
  const cols = [...(ticNames || []).filter(Boolean), UNASSIGNED]
  const matrix = {} // status -> { tic -> count }

  ;(proposals || []).forEach((p) => {
    if (!p) return
    const status = p.proposalStatus
    if (status === null || status === undefined || status === '') return
    const tic = (p.assignToInstitution && known.has(p.assignToInstitution)) ? p.assignToInstitution : UNASSIGNED
    if (!matrix[status]) matrix[status] = {}
    matrix[status][tic] = (matrix[status][tic] || 0) + 1
  })

  const statuses = Object.keys(matrix)
    .map((status) => {
      const counts = matrix[status]
      const total = Object.values(counts).reduce((a, b) => a + b, 0)
      return { status, counts, total }
    })
    .sort((a, b) => b.total - a.total || a.status.localeCompare(b.status))

  const colTotals = {}
  cols.forEach((c) => { colTotals[c] = statuses.reduce((s, row) => s + (row.counts[c] || 0), 0) })
  const grandTotal = statuses.reduce((s, row) => s + row.total, 0)
  const max = statuses.reduce((m, row) => cols.reduce((mm, c) => Math.max(mm, row.counts[c] || 0), m), 0)

  return { statuses, cols, colTotals, grandTotal, max }
}
