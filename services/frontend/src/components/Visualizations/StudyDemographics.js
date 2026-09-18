import React, { useState } from 'react'
import { Box, Grid, FormControlLabel, Switch } from '@material-ui/core'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import { DemographicsPie } from '../Charts/DemographicsPie'
import { Paragraph, Subheading } from '../Typography'

// Per-study enrollment demographics in the NIH structure (planned + actual,
// ethnicity x sex + race x sex). `demographics` is the single EnrollmentDemographics
// row (columns like plannedHispanicFemale / actualWhiteMale). Two axes are
// selectable; a "Show targets" toggle adds the planned donut beside the actual one.
const num = (v) => parseInt(v || 0, 10)

// [display label, column suffix] for the ethnicity x sex axis (matches the mockup).
const ETHNICITY = [
  ['Hispanic Female', 'HispanicFemale'],
  ['Hispanic Male', 'HispanicMale'],
  ['Non-Hispanic Female', 'NonHispanicFemale'],
  ['Non-Hispanic Male', 'NonHispanicMale'],
]
// Race axis — summed across sex for a readable 5-slice donut.
const RACES = ['AIAN', 'Asian', 'NHPI', 'Black', 'White']

const buildData = (row, kind, axis) =>
  axis === 'ethnicity'
    ? ETHNICITY.map(([label, key]) => ({ id: label, value: num(row[`${ kind }${ key }`]) }))
    : RACES.map((r) => ({ id: r, value: num(row[`${ kind }${ r }Female`]) + num(row[`${ kind }${ r }Male`]) }))

const totalOf = (data) => data.reduce((sum, d) => sum + d.value, 0)

export const StudyDemographics = ({ demographics }) => {
  const [axis, setAxis] = useState('ethnicity')
  const [showTargets, setShowTargets] = useState(false)

  const actual = buildData(demographics, 'actual', axis)
  const target = buildData(demographics, 'planned', axis)
  const hasActual = totalOf(actual) > 0
  const hasTarget = totalOf(target) > 0

  return (
    <Box>
      <Grid container spacing={2} alignItems="center" justify="space-between">
        <Grid item>
          <ToggleButtonGroup
            value={ axis }
            exclusive
            size="small"
            onChange={ (event, value) => value && setAxis(value) }
          >
            <ToggleButton value="ethnicity">Ethnicity</ToggleButton>
            <ToggleButton value="race">Race</ToggleButton>
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

      <Grid container spacing={4}>
        <Grid item xs={12} md={ showTargets ? 6 : 12 }>
          <Subheading>Enrolled ({ totalOf(actual) })</Subheading>
          { hasActual
            ? <DemographicsPie data={ actual } />
            : <Paragraph>No enrollment demographics recorded yet.</Paragraph> }
        </Grid>
        { showTargets && (
          <Grid item xs={12} md={6}>
            <Subheading>Target ({ totalOf(target) })</Subheading>
            { hasTarget
              ? <DemographicsPie data={ target } />
              : <Paragraph>No enrollment targets entered for this study.</Paragraph> }
          </Grid>
        ) }
      </Grid>
    </Box>
  )
}
