import React from 'react'
import { ResponsiveBar } from '@nivo/bar'
import ChartTooltip from '../Tooltip/ChartTooltip'

const ProposalsBarChart = props => {
    const { proposals, height, sorting, clickHandler } = props
    const proposalCounts = proposals.map(group => ({ id: group.name, value: group.proposals.length }))
    proposalCounts.sort((a, b) => a.id > b.id ? -1 : 1)
    if (sorting === 'value') proposalCounts.sort((a, b) => a.value < b.value ? -1 : 1)

    const longestLabelLength = Math.max(...proposalCounts.map(group => group.id.length))
    return (
        <div style={{ height: height }}>
            <ResponsiveBar
                height={ height - 32 }
                data={ proposalCounts }
                onClick={ clickHandler }
                layout="horizontal"
                tooltip={ ({ id, value, color, indexValue }) => (
                        <ChartTooltip color={ color }>
                            <div><strong>{ indexValue }</strong></div>
                            <div>{ value } Proposal{ value !==  1 ? 's' : null }</div>
                        </ChartTooltip>
                    )}
                enableGridX={ false }
                enableGridY={ false }
                colors="nivo"
                colorBy="value"
                margin={{ top: 0, right: 32, bottom: 0, left: longestLabelLength * 6 }}
                borderWidth={ 1 }
                borderColor="inherit:darker(0.75)"
                animate={ true }
                motionStiffness={ 90 }
                motionDamping={ 15 }
                axisLeft={{
                    tickSize: 0,
                    tickPadding: 3,
                    tickRotation: 0,
                    legend: '',
                    legendPosition: 'middle',
                    legendOffset: 0
                }}
                layers={ ['grid', 'bars', 'axes', 'markers', 'legends'] }
                enableLabel={ false }
            />
       </div>
    )
}

export default ProposalsBarChart