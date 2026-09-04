import React from 'react'
import { Box } from '@material-ui/core'
import { buildSiteContribution } from '../../utils/siteContribution'
import { DemographicsPie } from '../Charts/DemographicsPie'
import { Paragraph, Subheading } from '../Typography'

// Site Contribution donut: each site's share of study enrollment, plus a
// "Short of Goal" slice measuring the gap to the study's enrollment target.
export const SiteContribution = ({ sites, enrollmentGoal }) => {
  const { data, totalEnrolled, target, siteCount } = buildSiteContribution(sites, enrollmentGoal)

  if (data.length === 0) {
    return <Paragraph>No site enrollment data yet.</Paragraph>
  }

  return (
    <Box>
      <Subheading>
        { totalEnrolled }{ target ? ` of ${ target }` : '' } Enrolled &middot; { siteCount } Site{ siteCount !== 1 ? 's' : '' }
      </Subheading>
      <DemographicsPie data={ data } />
    </Box>
  )
}
