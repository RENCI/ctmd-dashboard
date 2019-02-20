import React from 'react'
import ChartTooltip from './ChartTooltip'
import { ResponsivePie } from '@nivo/pie'

const ProposalsPieChart = props => {
    const { proposals, clickHandler } = props
    const proposalGroups = proposals.map(group => ({ id: group.name, value: group.proposals.length }))

    return (
        <ResponsivePie
            height={ 500 }
            data={ proposalGroups }
            tooltip={ ChartTooltip }
            onClick={ clickHandler }
            colors="nivo"
            colorBy="id"
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
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
    )
}

export default ProposalsPieChart