import React, { useContext, useState, useEffect } from 'react'
import { useTheme } from '@material-ui/styles'
import { ResponsiveBar } from '@nivo/bar'
import { schemeSet2, schemePaired } from 'd3-scale-chromatic'
import { ChartTooltip } from '../Tooltip'
import { CardContent } from '@material-ui/core'
import { StoreContext } from '../../contexts/StoreContext'
import { CircularLoader } from '../Progress/Progress'
import { useProposals } from '../../hooks'
import { Widget } from './Widget'

// This chart breaks proposals into ~18 granular statuses, so it needs more than
// the dashboard's 8-colour palette to keep every status visually distinct.
const PALETTE = [...schemeSet2, ...schemePaired]

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
    const proposals = useProposals()
    const [proposalGroups, setProposalGroups] = useState()
    const theme = useTheme()

    useEffect(() => {
        if (proposals && store.tics) {
            const tics = store.tics.map(({ name }) => ({ name: name, proposals: [] })).concat({ name: null, proposals: [] })
            proposals.forEach(proposal => {
                // Map to the display name WITHOUT mutating the shared store object
                // (other widgets read the raw proposalStatus — e.g. ProposalsByConsultationStatus).
                const index = tics.findIndex(({ name }) => name === proposal.assignToInstitution)
                if (index >= 0) {
                    tics[index].proposals.push({ proposalStatus: getDisplayName(proposal.proposalStatus) })
                }
            })
            setProposalGroups(tics.map(tic => ({ name: tic.name || 'Unassigned', ...tic.proposals.countBy('proposalStatus') })))
        }
    }, [proposals, store.tics])

    const colors = PALETTE
    // Every status key (store statuses + mapped display names), stable order.
    // Computed once so the chart and the legend below stay in sync.
    const keys = (proposalGroups && store.statuses)
        ? [...new Set(
            store.statuses.map(({ description }) => description).concat(statusMap.map(({ displayName }) => displayName))
          )].sort((s, t) =>
            statusMap.findIndex(({ displayName }) => displayName === t) - statusMap.findIndex(({ displayName }) => displayName === s)
          )
        : []
    const keyColor = i => colors[i % colors.length]
    
    return (
        <Widget
            title="Proposals by Application Status"
            subtitle="Grouped by TIC/RIC"
        >
            <CardContent>
                {
                    (proposalGroups && store.statuses) ? (
                      <div>
                        <div style={{ height: 440 }}>
                        <ResponsiveBar
                            data={ proposalGroups }
                            keys={ keys }
                            indexBy="name"
                            margin={{ top: 20, right: 12, bottom: 96, left: 0 }}
                            padding={ 0.3 }
                            groupMode="stacked"
                            layout="vertical"
                            height={ 500 }
                            colors={ colors }
                            colorBy="id"
                            borderColor={ theme.palette.background.paper }
                            borderWidth={ 1.5 }
                            axisLeft={ null }
                            axisBottom={{
                                renderTick: tick => (
                                    <g key={ tick.key } transform={ `translate(${ tick.x },${ tick.y + 10 })` }>
                                        <text transform="rotate(-22)" style={{ fill: theme.palette.text.secondary, fontSize: 10 }} textAnchor="end">
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
                            legends={ [] }
                            tooltip={ ({ id, value, color, indexValue }) => (
                                <ChartTooltip color={ color }>
                                    <div><strong>{ indexValue }</strong></div>
                                    <div>{ id }</div>
                                    <div>{ value } Proposal{ value > 1 ? 's' : null }</div>
                                </ChartTooltip>
                            )}
                        />
                        </div>
                        {/* full, always-visible legend of every status (fixes the cut-off right-side legend) */}
                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${ theme.palette.divider }`, display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
                            { keys.map((k, i) => (
                                <span key={ k } style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: '0.8rem', color: theme.palette.text.primary }}>
                                    <span style={{ width: 13, height: 13, borderRadius: 3, background: keyColor(i), flexShrink: 0 }} />
                                    { k }
                                </span>
                            )) }
                        </div>
                      </div>
                    ) : <CircularLoader />
                }
            </CardContent>
        </Widget>
    )
}
