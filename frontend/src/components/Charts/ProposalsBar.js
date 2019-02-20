import React from 'react'
import ChartTooltip from './ChartTooltip'
import { Bar } from '@nivo/bar'

const ProposalsBarChart = props => {
    const { proposals, clickHandler } = props
    const proposalGroups = proposals.map(group => ({ id: group.name, value: group.proposals.length }))

    return (
        <Bar
            height={ 500 }
            width={ 500 }
            data={ proposalGroups }
            layout="horizontal"
            // For some reason, nivo pie chart works fine and shows the `id` property fine,
            // but the bar chart has id: "value" for every group.
            // This is a fix for that: reassign id to be the value of `indexValue`.
            tooltip={ ({id, value, color, indexValue}) => ChartTooltip({ id: indexValue, value, color }) } 
            onClick={ clickHandler }
            colors="nivo"
            colorBy="id"
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            borderWidth={ 1 }
            borderColor="inherit:darker(0.2)"
            animate={ true }
            motionStiffness={ 90 }
            motionDamping={ 15 }
            axisBottom={{
                tickSize: 0,
                tickPadding: -2,
                tickRotation: 270,
                legend: 'Submitting Institution',
                legendPosition: 'middle',
                legendOffset: 32
            }}
            layers={ ['grid', 'bars', 'axes', 'markers', 'legends'] }
            enableLabel={ false }
        />
    )
}

export default ProposalsBarChart