import React, { useState } from 'react'
import { Box, Grid, FormControlLabel, Switch } from '@material-ui/core'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import { useTheme } from '@material-ui/styles'
import { DemographicsRing } from '../Charts/DemographicsRing'
import { buildRingData, ringTotals, lighten, darken } from '../../utils/demographicsRing'
import { Paragraph, Subheading } from '../Typography'

// Per-study enrollment demographics in the NIH structure (CTMD-204). One shaded
// ring per view: each race/ethnicity wedge split by sex (lighter female, darker
// male). `demographics` is the single EnrollmentDemographics row (columns like
// plannedHispanicFemale / actualWhiteMale). An Ethnicity/Race toggle switches the
// axis; a "Show targets" switch adds the planned ring beside the actual one. The
// full counts (per category, with the sex split and actual-vs-target) sit in the
// breakdown below the ring.
const pct = (v, total) => (total ? `${ Math.round((v / total) * 100) }%` : '0%')

// One category's "790 · 62% (♀410 ♂380)" value line.
const ValueLine = ({ row, total, theme }) => (
  <span style={{ color: theme.palette.text.secondary, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
    <b style={{ color: theme.palette.text.primary }}>{ (row.f + row.m).toLocaleString() }</b>
    { ` · ${ pct(row.f + row.m, total) } ` }
    <span style={{ color: theme.palette.text.hint || theme.palette.text.secondary }}>
      { `(♀${ row.f.toLocaleString() } ♂${ row.m.toLocaleString() })` }
    </span>
  </span>
)

export const StudyDemographics = ({ demographics }) => {
  const [axis, setAxis] = useState('race')
  const [showTargets, setShowTargets] = useState(false)
  const theme = useTheme()
  const colors = theme.palette.chartColors || []

  const actual = buildRingData(demographics, 'actual', axis)
  const planned = buildRingData(demographics, 'planned', axis)
  const aTotals = ringTotals(actual)
  const pTotals = ringTotals(planned)
  const hasActual = aTotals.total > 0
  const hasTarget = pTotals.total > 0

  return (
    <Box>
      <Grid container spacing={ 2 } alignItems="center" justify="space-between">
        <Grid item>
          <ToggleButtonGroup
            value={ axis }
            exclusive
            size="small"
            onChange={ (event, value) => value && setAxis(value) }
          >
            <ToggleButton value="race">Race</ToggleButton>
            <ToggleButton value="ethnicity">Ethnicity</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid item>
          <FormControlLabel
            control={ <Switch checked={ showTargets } onChange={ (event) => setShowTargets(event.target.checked) } /> }
            label="Show targets"
            labelPlacement="start"
          />
        </Grid>
      </Grid>

      <Grid container spacing={ 4 }>
        <Grid item xs={ 12 } md={ showTargets ? 6 : 12 }>
          <Subheading>Actual enrollment</Subheading>
          { hasActual
            ? <DemographicsRing data={ actual } kind="actual" />
            : <Paragraph>No enrollment demographics recorded yet.</Paragraph> }
        </Grid>
        { showTargets && (
          <Grid item xs={ 12 } md={ 6 }>
            <Subheading>Planned target</Subheading>
            { hasTarget
              ? <DemographicsRing data={ planned } kind="planned" />
              : <Paragraph>No enrollment targets entered for this study.</Paragraph> }
          </Grid>
        ) }
      </Grid>

      {/* Breakdown underneath: per category, the sex split and (when targets are on) actual vs target. */}
      { hasActual && (
        <Box component="ul" mt={ 2 } mb={ 0 } p={ 0 } style={{
          listStyle: 'none',
          display: 'grid',
          gap: '6px 22px',
          gridTemplateColumns: 'repeat(auto-fill, minmax(234px, 1fr))',
        }}>
          { actual.map((row, i) => {
            const base = colors[i % colors.length] || '#999999'
            const target = planned.find((p) => p.cat === row.cat) || { f: 0, m: 0 }
            return (
              <li key={ row.cat } style={{ padding: '6px 0', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 13, height: 13, borderRadius: 3, background: base, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontWeight: 600, color: theme.palette.text.primary }}>{ row.cat }</span>
                  { !showTargets && <ValueLine row={ row } total={ aTotals.total } theme={ theme } /> }
                </div>
                { showTargets && (
                  <React.Fragment>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, paddingLeft: 23, marginTop: 3 }}>
                      <span style={{ width: 44, flexShrink: 0, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: theme.palette.text.secondary }}>Actual</span>
                      <ValueLine row={ row } total={ aTotals.total } theme={ theme } />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, paddingLeft: 23, marginTop: 3 }}>
                      <span style={{ width: 44, flexShrink: 0, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: theme.palette.text.secondary }}>Target</span>
                      <ValueLine row={ target } total={ pTotals.total } theme={ theme } />
                    </div>
                  </React.Fragment>
                ) }
              </li>
            )
          }) }
        </Box>
      ) }

      {/* Shading key */}
      { hasActual && (
        <Box mt={ 1.5 } pt={ 1.5 } style={{ borderTop: `1px dashed ${ theme.palette.divider }`, display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: '0.78rem', color: theme.palette.text.secondary }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <span style={{ display: 'inline-flex', borderRadius: 4, overflow: 'hidden', border: `1px solid ${ theme.palette.divider }` }}>
              <span style={{ width: 16, height: 14, background: lighten('#9aa4ad', 0.18) }} />
              <span style={{ width: 16, height: 14, background: darken('#9aa4ad', 0.28) }} />
            </span>
            Shading = sex
          </span>
          <span><b style={{ color: theme.palette.text.primary }}>Lighter</b> = Female</span>
          <span><b style={{ color: theme.palette.text.primary }}>Darker</b> = Male</span>
          <span>Colour = category</span>
        </Box>
      ) }
    </Box>
  )
}
