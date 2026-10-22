import React, { useContext } from 'react'
import { CardContent } from '@material-ui/core'
import { useTheme } from '@material-ui/styles'
import { interpolateBlues } from 'd3-scale-chromatic'
import { StoreContext } from '../../contexts/StoreContext'
import { useProposals } from '../../hooks'
import { CircularLoader } from '../Progress/Progress'
import { Widget } from './Widget'
import { buildStatusMatrix } from '../../utils/statusMatrix'

// "Proposals by Application Status" as a matrix: every in-use status is a row,
// each TIC (plus an Unassigned bucket) a column, each cell shaded by count on the
// dashboard's blue scale (interpolateBlues — the same ramp the Calendar widget
// uses). Everything — rows, columns, colour scale — derives from the data, so a
// new REDCap status appears automatically. Plain CSS table, no charting library.
export const ProposalsByApplicationStatusMatrix = () => {
  const [store] = useContext(StoreContext)
  const proposals = useProposals()
  const theme = useTheme()

  const header = {
    title: 'Proposals by Application Status',
    subtitle: 'Proposals per TIC by status · cell shaded by count',
    info: 'Every status currently in use is a row; TICs (plus an Unassigned bucket) are columns; each cell is shaded by the number of proposals. Rows, columns and the colour scale all come from the data, so a new status appears automatically.',
    exportFilename: 'proposals-by-application-status',
  }

  if (!store.proposals || !store.tics) {
    return <Widget { ...header }><CardContent><CircularLoader /></CardContent></Widget>
  }

  const ticNames = store.tics.map(({ name }) => name)
  const { statuses, cols, colTotals, grandTotal, max } = buildStatusMatrix(proposals, ticNames)

  const ratio = (c) => (max ? c / max : 0)
  const cellBg = (c) => (c ? interpolateBlues(0.12 + 0.88 * ratio(c)) : theme.palette.background.paper)
  const cellFg = (c) => (c && ratio(c) > 0.45 ? '#ffffff' : theme.palette.text.primary)

  const th = { padding: '6px 8px', fontSize: 11.5, fontWeight: 600, color: theme.palette.text.secondary, verticalAlign: 'bottom' }
  const td = { padding: '6px 8px', textAlign: 'center', borderRadius: 4, fontVariantNumeric: 'tabular-nums', minWidth: 44, fontSize: 12.5 }
  const rowh = { padding: '6px 8px', textAlign: 'left', fontWeight: 500, fontSize: 12.5, color: theme.palette.text.primary, background: theme.palette.grey[50], maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', borderRadius: 4 }
  const tot = { ...td, fontWeight: 700, color: theme.palette.text.primary, background: theme.palette.grey[100] }

  return (
    <Widget { ...header }>
      <CardContent>
        { statuses.length === 0 ? (
          <p style={{ color: theme.palette.text.secondary }}>No proposals yet.</p>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 12, color: theme.palette.text.secondary }}>
              Fewer
              <span style={{
                width: 150, height: 12, borderRadius: 3, border: `1px solid ${ theme.palette.divider }`,
                background: `linear-gradient(90deg, ${ interpolateBlues(0.06) }, ${ interpolateBlues(0.4) }, ${ interpolateBlues(0.72) }, ${ interpolateBlues(1) })`,
              }} />
              More
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'separate', borderSpacing: 2 }}>
                <thead>
                  <tr>
                    <th style={{ ...th, textAlign: 'left' }}>Status</th>
                    { cols.map((c) => (
                      <th key={ c } style={{ ...th, textAlign: 'center', maxWidth: 90, whiteSpace: 'normal', lineHeight: 1.15 }} title={ c }>{ c }</th>
                    )) }
                    <th style={{ ...th, textAlign: 'center' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  { statuses.map((row) => (
                    <tr key={ row.status }>
                      <th style={ rowh } title={ row.status }>{ row.status }</th>
                      { cols.map((c) => {
                        const v = row.counts[c] || 0
                        return (
                          <td key={ c } style={{ ...td, background: cellBg(v), color: cellFg(v) }} title={ `${ c } · ${ row.status }: ${ v }` }>
                            { v || '' }
                          </td>
                        )
                      }) }
                      <td style={ tot }>{ row.total }</td>
                    </tr>
                  )) }
                </tbody>
                <tfoot>
                  <tr>
                    <th style={{ ...rowh, background: theme.palette.grey[100], fontWeight: 700 }}>Total</th>
                    { cols.map((c) => <td key={ c } style={ tot }>{ colTotals[c] }</td>) }
                    <td style={ tot }>{ grandTotal }</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) }
      </CardContent>
    </Widget>
  )
}
