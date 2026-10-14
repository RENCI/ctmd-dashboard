import React, { useContext } from 'react'
import { CardContent } from '@material-ui/core'
import { useTheme } from '@material-ui/styles'
import { StoreContext } from '../../contexts/StoreContext'
import { useProposals } from '../../hooks'
import { CircularLoader } from '../Progress/Progress'
import { Widget } from './Widget'
import { buildTicConsultationData, niceMax, CONSULTATION_PHASES } from '../../utils/consultationStatus'

// Horizontal "Proposals by Consultation Status" chart — proposals per TIC, split
// into the five consultation-status groups. Plain CSS bars (no charting library):
// rows are clearly separated and segments carry a 2px surface gap so colours don't
// bleed, and every phase shows in a full legend below. Colours come from the
// dashboard palette (theme.palette.chartColors), "Other" muted to grey.
const COL = '168px 1fr 44px'

export const ProposalsByConsultationStatus = () => {
  const [store] = useContext(StoreContext)
  const proposals = useProposals()
  const theme = useTheme()
  const colors = theme.palette.chartColors || []
  const phaseColor = (i) => (i === CONSULTATION_PHASES.length - 1 ? theme.palette.grey[400] : colors[i % colors.length])

  const ticNames = (store.tics || []).map(({ name }) => name)
  const data = buildTicConsultationData(proposals, ticNames)
  const scale = niceMax(data.reduce((m, d) => Math.max(m, d.total), 0))
  const phaseTotals = CONSULTATION_PHASES.map((ph) => data.reduce((s, d) => s + d.counts[ph], 0))

  const trackBg = {
    background: theme.palette.grey[100],
    backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent calc(25% - 1px), ${ theme.palette.grey[300] } calc(25% - 1px), ${ theme.palette.grey[300] } 25%)`,
  }

  return (
    <Widget title="Proposals by Consultation Status" subtitle="Proposals per TIC, by consultation phase">
      <CardContent>
        { (!proposals || !store.tics) ? (
          <CircularLoader />
        ) : data.length === 0 ? (
          <p style={{ color: theme.palette.text.secondary }}>No proposals assigned to a TIC yet.</p>
        ) : (
          <div>
            { data.map((d, idx) => (
              <div key={ d.tic } style={{
                display: 'grid', gridTemplateColumns: COL, alignItems: 'center', gap: 14, padding: '9px 0',
                borderTop: idx === 0 ? 'none' : `1px solid ${ theme.palette.divider }`,
              }}>
                <span style={{ fontWeight: 600, fontSize: '0.84rem', textAlign: 'right', lineHeight: 1.25 }}>{ d.tic }</span>
                <div style={{ position: 'relative', height: 26, borderRadius: 5, display: 'flex', overflow: 'hidden', ...trackBg }}>
                  { CONSULTATION_PHASES.map((ph, i) => {
                    const count = d.counts[ph]
                    if (count <= 0) return null
                    return (
                      <div
                        key={ ph }
                        title={ `${ d.tic } · ${ ph }: ${ count } (${ Math.round((count / d.total) * 100) }% of TIC)` }
                        style={{
                          height: '100%', width: `${ (count / scale) * 100 }%`, background: phaseColor(i),
                          boxShadow: `inset 2px 0 0 ${ theme.palette.background.paper }`,
                        }}
                      />
                    )
                  }) }
                </div>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, textAlign: 'right', fontSize: '0.84rem' }}>
                  { d.total }
                </span>
              </div>
            )) }

            {/* shared x-axis */}
            <div style={{ display: 'grid', gridTemplateColumns: COL, gap: 14, marginTop: 4 }}>
              <div style={{ gridColumn: 2, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: theme.palette.text.secondary, fontVariantNumeric: 'tabular-nums' }}>
                <span>0</span><span>{ scale / 4 }</span><span>{ scale / 2 }</span><span>{ (scale * 3) / 4 }</span><span>{ scale }</span>
              </div>
            </div>

            {/* full legend — every phase, always visible */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${ theme.palette.divider }`, display: 'flex', flexWrap: 'wrap', gap: '10px 22px' }}>
              { CONSULTATION_PHASES.map((ph, i) => (
                <span key={ ph } style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: theme.palette.text.primary }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: phaseColor(i), flexShrink: 0 }} />
                  { ph } <span style={{ color: theme.palette.text.secondary, fontVariantNumeric: 'tabular-nums' }}>({ phaseTotals[i] })</span>
                </span>
              )) }
            </div>
          </div>
        ) }
      </CardContent>
    </Widget>
  )
}
