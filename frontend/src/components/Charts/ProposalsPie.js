import React, { Fragment } from 'react'
import { ResponsivePie } from '@nivo/pie'

const tooltip = (event) => {
    const { id, value, color } = event
    return (
        <Fragment>
            <div style ={{ display: 'flex', }}>
                <div style={{ display: 'inline', backgroundColor: color, width: '2.4rem', height: '2.4rem', marginRight: '0.5rem', }}>&nbsp;</div>
                <div style={{ flex: 1, lineHeight: '1.2rem', }}>
                    <div><strong>{ id }</strong></div>
                    <div>{ value } Proposal{ value !==  1 ? 's' : null }</div>
                </div>
            </div>
        </Fragment>
    )
}

const ProposalsPieChart = (props) => {
    const { proposals, clickHandler } = props
    const proposalGroups = proposals.map(group => {
        return {
            id: group.name,
            value: group.proposals.length,
        }
    })
    return (
        <ResponsivePie
            data={ proposalGroups }
            margin={{
                "top": 40,
                "right": 80,
                "bottom": 80,
                "left": 80
            }}
            innerRadius={ 0.5 }
            padAngle={ 0.7 }
            cornerRadius={ 3 }
            colors="nivo"
            colorBy="id"
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
            defs={[
                {
                    "id": "dots",
                    "type": "patternDots",
                    "background": "inherit",
                    "color": "rgba(255, 255, 255, 0.3)",
                    "size": 4,
                    "padding": 1,
                    "stagger": true
                },
                {
                    "id": "lines",
                    "type": "patternLines",
                    "background": "inherit",
                    "color": "rgba(255, 255, 255, 0.3)",
                    "rotation": -45,
                    "lineWidth": 6,
                    "spacing": 10
                }
            ]}
            tooltip={ tooltip }
            onClick={ clickHandler }
        />
    )
}

export default ProposalsPieChart