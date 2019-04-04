import React, { useContext, useState, useEffect, useRef } from 'react'
import { useTheme } from '@material-ui/styles'
import { ResponsiveBar } from '@nivo/bar'
import ChartTooltip from '../Tooltip/ChartTooltip'
import { Card, CardHeader, CardContent } from '@material-ui/core'
import { StoreContext } from '../../contexts/StoreContext'
import { CircularLoader } from '../Progress/Progress'
import useWindowWidth from '../../hooks/useWindowWidth'

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
    const container = useRef(null)
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
        translateX: windowWidth < 1000 ? 0 : 156,
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
        <Card ref={ container }>
            <CardHeader title="" subheader="" />
            <CardContent style={{ height: '450px' }}>
                {
                    (proposalGroups && store.statuses) ? (
                        <ResponsiveBar
                            data={ proposalGroups }
                            keys={ store.statuses.map(({ description }) => description) }
                            indexBy="name"
                            margin={{ top: 32, right: windowWidth < 1000 ? 0 : 156, bottom: 50, left: 0 }}
                            padding={ 0.05 }
                            groupMode="stacked"
                            layout="vertical"
                            height={ 400 }
                            colors={ theme.palette.chartColors }
                            colorBy="id"
                            borderColor="inherit:darker(1.6)"
                            axisLeft={ null }
                            axisBottom={{
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: 0,
                                legend: '',
                                legendPosition: 'middle',
                                legendOffset: -40
                            }}
                            enableGridX={ false }
                            enableGridY={ false }
                            labelSkipWidth={ 12 }
                            labelSkipHeight={ 12 }
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
        </Card>
    )
}

export default proposalsGroupedByTicThenStatus