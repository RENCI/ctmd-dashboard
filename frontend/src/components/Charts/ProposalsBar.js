import React from 'react'
import ChartTooltip from './ChartTooltip'
import { ResponsiveBar } from '@nivo/bar'

const ProposalsBarChart = props => {
    const { proposals, clickHandler, height } = props
    const proposalGroups = proposals.map(group => ({ id: group.name, value: group.proposals.length }))
    const longestLabelLength = Math.max(...proposalGroups.map(group => group.id.length))
    return (
        <div style={{ height: height }}>
            <ResponsiveBar
                data={ proposalGroups }
                height={ height - 32 }
                layout="horizontal"
                // For some reason, nivo pie chart works fine and shows the `id` property fine,
                // but the bar chart has id: "value" for every group.
                // This is a fix for that: reassign id to be the value of `indexValue`.
                tooltip={ ({ id, value, color, indexValue }) => ChartTooltip({ id: indexValue, value, color }) } 
                onClick={ clickHandler }
                enableGridX={ false }
                enableGridY={ false }
                colors="nivo"
                colorBy="id"
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