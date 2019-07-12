import React from 'react'
import { ChartTooltip } from '../Tooltip'
import { ResponsivePie } from '@nivo/pie'
import { useTheme } from '@material-ui/styles'

export const ProposalsPieChart = props => {
    const { proposals, clickHandler, height, sorting } = props
    const proposalCounts = proposals.map(group => ({ id: group.name, value: group.proposals.length }))
    const theme = useTheme()
    
    if (sorting === 'alpha') proposalCounts.sort((a, b) => a.id > b.id ? -1 : 1)
    if (sorting === 'value') proposalCounts.sort((a, b) => a.value < b.value ? -1 : 1)

    return (
        <div style={{ height: height }}>
            <ResponsivePie
                height={ height - 32}
                data={ proposalCounts }
                tooltip={ ({ id, value, color, indexValue }) => (
                        <ChartTooltip color={ color }>
                            <div><strong>{ id }</strong></div>
                            <div>{ value } Proposal{ value !==  1 ? 's' : null }</div>
                        </ChartTooltip>
                    )}
                onClick={ clickHandler }
                colors={ theme.palette.chartColors }
                colorBy="id"
                margin={{ top: 16, right: 0, bottom: 32, left: 0 }}
                innerRadius={ 0.5 }
                padAngle={ 0.7 }
                cornerRadius={ 3 }
                borderWidth={ 1 }
                borderColor="inherit:darker(0.2)"
                radialLabelsSkipAngle={ 10 }
                radialLabelsTextXOffset={ 6 }
                radialLabelsTextColor="#333333"
                radialLabelsLinkOffset={ 0 }
                radialLabelsLinkDiagonalLength={ 16 }
                radialLabelsLinkHorizontalLength={ 24 }
                radialLabelsLinkStrokeWidth={ 1 }
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
