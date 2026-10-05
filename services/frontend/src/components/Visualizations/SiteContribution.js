import React, { useState } from 'react'
import { Box, Button } from '@material-ui/core'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import { useTheme } from '@material-ui/styles'
import { buildSiteContribution } from '../../utils/siteContribution'
import { DemographicsPie } from '../Charts/DemographicsPie'
import { DemographicsRing } from '../Charts/DemographicsRing'
import { buildRingData, ringTotals } from '../../utils/demographicsRing'
import { Paragraph, Subheading } from '../Typography'

// Site Contribution donut: each site's share of study enrollment, plus a
// "Short of Goal" slice measuring the gap to the study's enrollment target.
//
// Clicking a site drills into that site's own ACTUAL enrollment demographics
// (ethnicity/race x sex shaded ring), now that actuals are stored per site
// (CTMD-199/201). Radial arc labels collide once a study has more than a handful
// of sites, so we disable them on the donut and render our own legend. nivo
// (colorBy="id") maps data order -> color via an ordinal scale, so data[i] gets
// chartColors[i]; we replicate that here to keep the swatches in sync.
const siteLabel = (s) => s.siteName || `Site ${ s.siteId || '?' }`

export const SiteContribution = ({ sites, enrollmentGoal }) => {
  const theme = useTheme()
  const [selected, setSelected] = useState(null)
  const [axis, setAxis] = useState('race')
  const { data, totalEnrolled, target, siteCount } = buildSiteContribution(sites, enrollmentGoal)

  if (data.length === 0) {
    return <Paragraph>No site enrollment data yet.</Paragraph>
  }

  const colors = theme.palette.chartColors || []
  const grandTotal = data.reduce((sum, d) => sum + d.value, 0)
  const siteByName = {}
  ;(Array.isArray(sites) ? sites : []).forEach((s) => { siteByName[siteLabel(s)] = s })

  // ── Drill-down: one site's actual enrollment by ethnicity/race x sex ─────────
  if (selected) {
    const ringData = buildRingData(selected, 'actual', axis)
    const hasData = ringTotals(ringData).total > 0
    const total = ringTotals(ringData).total
    return (
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" style={{ gap: 8 }}>
          <Button size="small" onClick={ () => setSelected(null) }>&larr; All sites</Button>
          <ToggleButtonGroup value={ axis } exclusive size="small" onChange={ (event, value) => value && setAxis(value) }>
            <ToggleButton value="race">Race</ToggleButton>
            <ToggleButton value="ethnicity">Ethnicity</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Subheading>{ siteLabel(selected) } &middot; actual enrollment</Subheading>
        { hasData ? (
          <Box>
            <Box maxWidth={ 360 } mx="auto">
              <DemographicsRing data={ ringData } kind="actual" />
            </Box>
            <Box component="ul" mt={ 1 } mb={ 0 } p={ 0 } style={{
              listStyle: 'none', display: 'grid', gap: '4px 20px',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            }}>
              { ringData.map((row, i) => (
                <li key={ row.cat } style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0', fontSize: '0.85rem' }}>
                  <span style={{ width: 13, height: 13, borderRadius: 3, background: colors[i % colors.length], flexShrink: 0 }} />
                  <span style={{ flex: 1, fontWeight: 600, color: theme.palette.text.primary }}>{ row.cat }</span>
                  <span style={{ color: theme.palette.text.secondary, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                    <b style={{ color: theme.palette.text.primary }}>{ (row.f + row.m).toLocaleString() }</b>
                    { total ? ` · ${ Math.round(((row.f + row.m) / total) * 100) }% ` : ' ' }
                    <span style={{ color: theme.palette.text.hint || theme.palette.text.secondary }}>
                      { `(♀${ row.f } ♂${ row.m })` }
                    </span>
                  </span>
                </li>
              )) }
            </Box>
          </Box>
        ) : (
          <Paragraph>No demographic breakdown recorded for this site yet.</Paragraph>
        ) }
      </Box>
    )
  }

  // ── Default: contribution donut + clickable legend ───────────────────────────
  return (
    <Box>
      <Subheading>
        { totalEnrolled }{ target ? ` of ${ target }` : '' } Enrolled &middot; { siteCount } Site{ siteCount !== 1 ? 's' : '' }
      </Subheading>
      <Paragraph>Select a site to see its enrollment by ethnicity/race and sex.</Paragraph>

      <Box display="flex" flexWrap="wrap" alignItems="center">
        <Box flex="1 1 320px" minWidth={ 300 }>
          <DemographicsPie data={ data } enableRadialLabels={ false } enableSlicesLabels={ false } />
        </Box>

        <Box
          component="ul"
          flex="1 1 260px"
          m={ 0 }
          p={ 0 }
          style={{
            listStyle: 'none',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            columnGap: 16,
          }}
        >
          { data.map((d, i) => {
            const site = siteByName[d.id] // undefined for the synthetic "Short of Goal" slice
            const clickable = Boolean(site)
            const select = () => clickable && setSelected(site)
            return (
              <li
                key={ d.id }
                role={ clickable ? 'button' : undefined }
                tabIndex={ clickable ? 0 : undefined }
                onClick={ select }
                onKeyDown={ (e) => { if (clickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select() } } }
                title={ clickable ? `${ d.id } — view demographics` : d.id }
                style={{
                  display: 'flex', alignItems: 'center', fontSize: '0.85rem', padding: '2px 4px',
                  cursor: clickable ? 'pointer' : 'default', borderRadius: 4,
                }}
              >
                <span
                  style={{
                    width: 12, height: 12, borderRadius: 2,
                    background: colors[i % colors.length], marginRight: 8, flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    textDecoration: clickable ? 'underline dotted' : 'none',
                    textUnderlineOffset: 3, color: clickable ? theme.palette.primary.main : 'inherit',
                  }}
                >
                  { d.id }
                </span>
                <span style={{ marginLeft: 8, color: theme.palette.grey[600], whiteSpace: 'nowrap' }}>
                  { d.value }{ grandTotal > 0 ? ` (${ Math.round((100 * d.value) / grandTotal) }%)` : '' }
                </span>
              </li>
            )
          }) }
        </Box>
      </Box>
    </Box>
  )
}
