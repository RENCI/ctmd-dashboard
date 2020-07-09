import React, { useContext, useState, useEffect } from 'react'
import { useTheme } from '@material-ui/styles'
import { ResponsiveBar } from '@nivo/bar'
import { ChartTooltip } from '../Tooltip'
import { CardContent } from '@material-ui/core'
import { StoreContext } from '../../contexts/StoreContext'
import { CircularLoader } from '../Progress/Progress'
import { useWindowSize } from '../../hooks'
import { Widget } from './Widget'

const statusMap = [
    {
        displayName: 'Initial Consult Ongoing',
        statuses: [
            'Ready for Initial Consultation',
            'Approved for Initial Consultation',
        ],
    },
    {
        displayName: 'Approved for Resources Pending Funding',
        statuses: [
            'Approved for Resource(s) Pending Receipt of Funding',
        ],
    },
    {
        displayName: 'Resources Ongoing',
        statuses: [
            'Approved for Resource(s)',
        ],
    },
    {
        displayName: 'Comprehensive Consultation Ongoing',
        statuses: [
            'Approved for Comprehensive Consultation',
            'Comprehensive Consult in Progress'
        ],
    },
    {
        displayName: 'Resources Complete',
        statuses: [
            'Resource(s) Complete',
        ],
    },
    {
        displayName: 'Comprehensive Consult Complete Grant Submitted',
        statuses: [
            'Comprehensive Complete - Grant Submitted',
        ],
    },
    {
        displayName: 'Implementation Ongoing',
        statuses: [
            'Ready for Implementation',
        ],
    },
    {
        displayName: 'No Further Network Support',
        statuses: [
            'No Further Network Support',
            'Not approved',
        ],
    },
    {
        displayName: 'Withdrawn by PI',
        statuses: [
            'Withdrawn by PI',
            'Withdrawn by PI post-award',
        ]
    },
    {
        displayName: 'Other',
        statuses: [
        ]
    },
]

const getDisplayName = status => {
    const index = statusMap.findIndex(({ statuses }) => statuses.includes(status))
    const displayName = index > -1 ? statusMap[index].displayName : status
    return displayName
}

Array.prototype.countBy = function(prop) {
    return this.reduce(function(groups, item) {
        const val = item[prop]
        groups[val] = groups[val] || 0
        groups[val] += 1
        return groups
    }, {})
}

export const ProposalsByTicBarChart = props => {
    const [store, ] = useContext(StoreContext)
    const [proposalGroups, setProposalGroups] = useState()
    const { width } = useWindowSize()
    const theme = useTheme()

    useEffect(() => {
        if (store.proposals && store.tics) {
            const tics = store.tics.map(({ name }) => ({ name: name, proposals: [] })).concat({ name: null, proposals: [] })
            store.proposals.forEach(proposal => {
                proposal.proposalStatus = getDisplayName(proposal.proposalStatus)
                const index = tics.findIndex(({ name }) => name === proposal.assignToInstitution)
                if (index >= 0) {
                    tics[index].proposals.push(proposal)
                }
            })
            setProposalGroups(tics.map(tic => ({ name: tic.name || 'None', ...tic.proposals.countBy('proposalStatus') })))
        }
    }, [store])
    
    const chartLegends = [{
        enableLabel: false,
        dataFrom: 'keys',
        anchor: 'top-right',
        direction: 'column',
        justify: false,
        translateX: width < 1000 ? 0 : 450,
        translateY: -32,
        itemsSpacing: 1,
        itemWidth: 20,
        itemHeight: 15,
        itemDirection: 'right-to-left',
        itemOpacity: 0.75,
        symbolSize: 15,
        effects: [{
            on: 'hover',
            style: { itemOpacity: 1.0 }
        }]
    }]
    
    return (
        <Widget
            title="Proposals by Application Status"
            subtitle="Grouped by TIC/RIC"
        >
            <CardContent style={{ height: '550px' }}>
                {
                    (proposalGroups && store.statuses) ? (
                        <ResponsiveBar
                            data={ proposalGroups }
                            keys={
                                [...new Set(store.statuses.map(({ description }) => description)
                                    .concat(statusMap.map(({ displayName }) => displayName)))
                                ].sort(
                                    (s, t) => {
                                        const sIndex = statusMap.findIndex(({ displayName }) => displayName === s)
                                        const tIndex = statusMap.findIndex(({ displayName }) => displayName === t)
                                        return tIndex - sIndex
                                    }
                                )
                            }
                            indexBy="name"
                            margin={{ top: 32, right: width < 1000 ? 0 : 450, bottom: 24, left: 0 }}
                            padding={ 0.05 }
                            groupMode="stacked"
                            layout="vertical"
                            height={ 500 }
                            colors={ theme.palette.chartColors }
                            colorBy="id"
                            borderColor="inherit:darker(1.6)"
                            axisLeft={ null }
                            axisBottom={{
                                renderTick: tick => (
                                    <g key={ tick.key } transform={ `translate(${ tick.x },${ tick.y + 16 }) `}>
                                        <text style={{ fill: '#333', fontSize: 10 }} textAnchor="middle" alignmentBaseline="middle">
                                            { tick.value }
                                            { ' ' }
                                            ({
                                                Object.keys(proposalGroups[tick.tickIndex]).reduce((sum, status) => {
                                                    if (status === 'name') return sum
                                                    return sum + proposalGroups[tick.tickIndex][status]
                                               }, 0)
                                            })
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
                            legends={ width < 1000 ? [] : chartLegends }
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
