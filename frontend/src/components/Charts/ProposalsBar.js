import React, { Fragment } from 'react'
import { ResponsiveBar } from '@nivo/bar'


const ProposalsBarChart = props => {
    const { proposals, clickHandler } = props
    const proposalGroups = proposals.map(group => ({ id: group.name, value: group.proposals.length }))
    const tooltip = ({ id, value, color }) => {
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
    return (
        <ResponsiveBar
            data={ proposalGroups }
            tooltip={ tooltip }
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