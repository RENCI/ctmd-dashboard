import React from 'react'
import { useTheme } from '@material-ui/styles'
import { arcPath, lighten, darken, ringTotals } from '../../utils/demographicsRing'

// A single-band donut for enrollment demographics (CTMD-204). Each race/ethnicity
// wedge is shaded by sex — lighter = female, darker = male — so category (hue) and
// sex (shade) read in one ring. Plain inline SVG, no charting library; colours come
// from the dashboard palette (theme.palette.chartColors = schemeSet2). `data` is
// [{ cat, f, m }, ...]; `kind` labels the centre ('actual' | 'planned').
const CX = 160, CY = 160, R_IN = 86, R_OUT = 150

export const DemographicsRing = ({ data, kind = 'actual', height = 300 }) => {
  const theme = useTheme()
  const colors = theme.palette.chartColors || []
  const gap = theme.palette.background.paper
  const ink = theme.palette.text.primary
  const soft = theme.palette.text.secondary
  const { f, m, total } = ringTotals(data)

  const slices = []
  let a = 0
  data.forEach((row, i) => {
    const base = colors[i % colors.length] || '#999999'
    const span = total ? ((row.f + row.m) / total) * 360 : 0
    const a0 = a
    const a1 = a + span
    const fSpan = (row.f + row.m) ? (row.f / (row.f + row.m)) * span : 0
    const pct = (v) => (total ? ` (${ Math.round((v / total) * 100) }%)` : '')
    slices.push({ d: arcPath(CX, CY, R_IN, R_OUT, a0, a0 + fSpan), fill: lighten(base, 0.18), label: `${ row.cat } · Female: ${ row.f }${ pct(row.f) }` })
    slices.push({ d: arcPath(CX, CY, R_IN, R_OUT, a0 + fSpan, a1), fill: darken(base, 0.2), label: `${ row.cat } · Male: ${ row.m }${ pct(row.m) }` })
    a = a1
  })

  return (
    <div style={{ height }}>
      <svg viewBox="0 0 320 320" width="100%" height={ height } style={{ overflow: 'visible' }} role="img"
        aria-label={ `${ kind === 'actual' ? 'Actual' : 'Planned' } enrollment by category and sex, total ${ total }` }>
        { slices.map((s, idx) => (
          <path key={ idx } d={ s.d } fill={ s.fill } stroke={ gap } strokeWidth={ 2 } strokeLinejoin="round">
            <title>{ s.label }</title>
          </path>
        )) }
        <text x={ CX } y={ CY - 4 } textAnchor="middle" style={{ fontSize: 34, fontWeight: 500, fill: ink }}>
          { total.toLocaleString() }
        </text>
        <text x={ CX } y={ CY + 16 } textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', fill: soft }}>
          { kind === 'actual' ? 'ENROLLED' : 'TARGET' }
        </text>
        <text x={ CX } y={ CY + 34 } textAnchor="middle" style={{ fontSize: 12, fill: soft }}>
          { `♀ ${ f.toLocaleString() }  ·  ♂ ${ m.toLocaleString() }` }
        </text>
      </svg>
    </div>
  )
}
