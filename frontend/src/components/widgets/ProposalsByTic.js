import React, { useContext, useState, useEffect, useRef } from 'react'
import { useTheme } from '@material-ui/styles'
import { ResponsiveBar } from '@nivo/bar'
import ChartTooltip from '../Tooltip/ChartTooltip'
import { Card, CardHeader, CardContent } from '@material-ui/core'
import { StoreContext } from '../../contexts/StoreContext'
import { CircularLoader } from '../Progress/Progress'
import useWindowWidth from '../../hooks/useWindowWidth'
import Widget from './Widget'

Array.prototype.countBy = function(prop) {
    return this.reduce(function(groups, item) {
        const val = item[prop]
        groups[val] = groups[val] || 0
        groups[val] += 1
        return groups
    }, {})
}

const proposalsGroupedByTicThenStatus = props => {
    const [store, ] = useContext(StoreContext)
    const [proposalGroups, setProposalGroups] = useState()
    const windowWidth = useWindowWidth()
    const theme = useTheme()

    useEffect(() => {
        if (store.proposals && store.tics) {
            const tics = store.tics.map(({ name }) => ({ name: name, proposals: [] }))
            store.proposals.forEach(proposal => {
                const index = tics.findIndex(({ name }) => name === proposal.assignToInstitution)
                if (index >= 0) tics[index].proposals.push(proposal)
            })
            setProposalGroups(tics.map(tic => ({ name: tic.name, ...tic.proposals.countBy('proposalStatus') })))
        }
    }, [store])
    
    const chartLegends = [{
        enableLabel: false,
        dataFrom: 'keys',
        anchor: 'top-right',
        direction: 'column',
        justify: false,
        translateX: windowWidth < 1000 ? 0 : 256,
        translateY: -32,
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
    }]

    return (
        <Widget
            title="Proposals by Status"
            subtitle="Grouped by TIC/RIC"
        >
            <CardContent style={{ height: '450px' }}>
                {
                    (proposalGroups && store.statuses) ? (
                        <ResponsiveBar
                            data={ proposalGroups }
                            keys={ store.statuses.map(({ description }) => description) }
                            indexBy="name"
                            margin={{ top: 32, right: windowWidth < 1000 ? 0 : 256, bottom: 50, left: 0 }}
                            padding={ 0.05 }
                            groupMode="stacked"
                            layout="vertical"
                            height={ 400 }
                            colors={ theme.palette.chartColors }
                            colorBy="id"
                            borderColor="inherit:darker(1.6)"
                            axisLeft={ null }
                            axisBottom={{
                                renderTick: tick => (
                                    <g key={ tick.key } transform={ `translate(${ tick.x },${ tick.y + 16 }) `}>
                                        <text style={{ fill: '#333', fontSize: 10 }} textAnchor="middle" alignmentBaseline="middle">
                                            { tick.value }
                                        </text>
                                    </g>
                                )
                            }}
                            enableGridX={ false }
                            enableGridY={ false }
                            labelSkipHeight={ 30 }
                            labelTextColor="inherit:darker(1.6)"
                            animate={ true }
                            motionStiffness={ 90 }
                            motionDamping={ 15 }
                            legends={ windowWidth < 1000 ? [] : chartLegends }
                            tooltip={ ({ id, value, color, indexValue }) => (
                                <ChartTooltip color={ color }>
                                    <div><strong>{ indexValue }</strong></div>
                                    <div>{ id }</div>
                                    <div>{ value } Proposal{ value > 1 ? 's' : null }</div>
                                </ChartTooltip>
                            )}
                        />
                    ) : <CircularLoader />
                }
            </CardContent>
        </Widget>
    )
}

export default proposalsGroupedByTicThenStatus