import React, { Fragment } from 'react'
import { ResponsiveBar } from '@nivo/bar'

Array.prototype.countBy = function(prop) {
    return this.reduce(function(groups, item) {
        const val = item[prop]
        groups[val] = groups[val] || 0
        groups[val] += 1
        return groups
    }, {})
}

const tooltip = (event) => {
    const { id, value, indexValue, color } = event
    return (
        <Fragment>
            <div style={{ display: 'flex', }}>
                <div style={{ display: 'inline', backgroundColor: color, width: '3.6rem', height: '3.6rem', marginRight: '0.5rem', }}>&nbsp;</div>
                <div style={{ flex: 1, lineHeight: '1.2rem', }}>
                    <div><strong>{ indexValue }</strong></div>
                    <div>{ id }</div>
                    <div>{ value } Proposal{ value > 1 ? 's' : null }</div>
                </div>
            </div>
        </Fragment>
    )
}

const proposalsGroupedByTicAndStatus = (props) => {
    const { proposals, statuses, colors } = props
    const proposalGroups = proposals.map((tic) => {
        return {
            name: tic.name,
            ...tic.proposals.countBy('proposal_status'),
        }
    })
    return (
        <Card square={ false }>
            <CardHeader title="Grouped by TIC/RIC" subheader="" />
            <CardContent style={{ height: '450px' }}>
                <ResponsiveBar
                    data={ proposalGroups }
                    keys={ statuses }
                    indexBy="name"
                    margin={{ top: 0, right: 64, bottom: 50, left: 0 }}
                    padding={ 0.05 }
                    groupMode="stacked"
                    layout="vertical"
                    height={ 400 }
                    colors="nivo"
                    colorBy="id"
                    borderColor="inherit:darker(1.6)"
                    axisLeft={ null }
                    axisBottom={{
                        'tickSize': 5,
                        'tickPadding': 5,
                        'tickRotation': 0,
                        'legend': '',
                        'legendPosition': 'middle',
                        'legendOffset': -40
                    }}
                    enableGridX={ false }
                    enableGridY={ false }
                    labelSkipWidth={ 12 }
                    labelSkipHeight={ 12 }
                    labelTextColor="inherit:darker(1.6)"
                    animate={ true }
                    motionStiffness={ 90 }
                    motionDamping={ 15 }
                    legends={ [{
                        enableLabel: false,
                        dataFrom: 'keys',
                        anchor: 'top-right',
                        direction: 'column',
                        justify: false,
                        translateX: 64,
                        translateY: 0,
                        itemsSpacing: 1,
                        itemWidth: 20,
                        itemHeight: 20,
                        itemDirection: 'right-to-left',
                        itemOpacity: 0.75,
                        symbolSize: 20,
                        effects: [{
                            on: 'hover',
                            style: { itemOpacity: 1.0 }
                        }]
                    }] }
                    tooltip={ tooltip }
                />
            </CardContent>
        </Card>
    )
}

export default proposalsGroupedByTicAndStatus