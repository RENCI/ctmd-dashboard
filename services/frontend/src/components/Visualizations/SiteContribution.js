import React from 'react'
import { Box } from '@material-ui/core'
import { useTheme } from '@material-ui/styles'
import { buildSiteContribution } from '../../utils/siteContribution'
import { DemographicsPie } from '../Charts/DemographicsPie'
import { Paragraph, Subheading } from '../Typography'

// Site Contribution donut: each site's share of study enrollment, plus a
// "Short of Goal" slice measuring the gap to the study's enrollment target.
//
// Radial arc labels collide once a study has more than a handful of sites, so we
// disable them on the donut and render our own legend. nivo (colorBy="id") maps
// data order → color via an ordinal scale, so data[i] gets chartColors[i]; we
// replicate that here to keep the swatches in sync with the slices.
export const SiteContribution = ({ sites, enrollmentGoal }) => {
  const theme = useTheme()
  const { data, totalEnrolled, target, siteCount } = buildSiteContribution(sites, enrollmentGoal)

  if (data.length === 0) {
    return <Paragraph>No site enrollment data yet.</Paragraph>
  }

  const colors = theme.palette.chartColors || []
  const grandTotal = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <Box>
      <Subheading>
        { totalEnrolled }{ target ? ` of ${ target }` : '' } Enrolled &middot; { siteCount } Site{ siteCount !== 1 ? 's' : '' }
      </Subheading>

      <Box display="flex" flexWrap="wrap" alignItems="center">
        <Box flex="1 1 320px" minWidth={ 300 }>
          <DemographicsPie data={ data } enableRadialLabels={ false } />
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
          { data.map((d, i) => (
            <li key={ d.id } style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', padding: '2px 0' }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  background: colors[i % colors.length],
                  marginRight: 8,
                  flexShrink: 0,
                }}
              />
              <span
                title={ d.id }
                style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                { d.id }
              </span>
              <span style={{ marginLeft: 8, color: theme.palette.grey[600], whiteSpace: 'nowrap' }}>
                { d.value }{ grandTotal > 0 ? ` (${ Math.round((100 * d.value) / grandTotal) }%)` : '' }
              </span>
            </li>
          )) }
        </Box>
      </Box>
    </Box>
  )
}
