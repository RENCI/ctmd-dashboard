import React from 'react'
import { ChartTooltip } from '../Tooltip'
import { ResponsivePie } from '@nivo/pie'
import { useTheme } from '@material-ui/styles'

// A multi-slice donut for enrollment demographics. `data` is [{ id, value }, ...].
// Mirrors ProposalsPieChart's nivo config for visual consistency with the rest
// of the dashboard.
export const DemographicsPie = ({ data, height = 300 }) => {
  const theme = useTheme()
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div style={{ height }}>
      <ResponsivePie
        height={ height - 8 }
        data={ data }
        tooltip={ ({ id, value, color }) => (
          <ChartTooltip color={ color }>
            <div><strong>{ id }</strong></div>
            <div>{ value }{ total > 0 ? ` (${ Math.round((100 * value) / total) }%)` : '' }</div>
          </ChartTooltip>
        )}
        colors={ theme.palette.chartColors }
        colorBy="id"
        margin={{ top: 24, right: 24, bottom: 24, left: 24 }}
        innerRadius={ 0.5 }
        padAngle={ 0.7 }
        cornerRadius={ 3 }
        borderWidth={ 1 }
        borderColor="inherit:darker(0.2)"
        radialLabelsSkipAngle={ 10 }
        radialLabelsTextColor="#333333"
        radialLabelsLinkColor="inherit"
        slicesLabelsSkipAngle={ 10 }
        slicesLabelsTextColor="#333333"
        animate={ true }
        motionStiffness={ 90 }
        motionDamping={ 15 }
      />
    </div>
  )
}
