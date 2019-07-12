import React, { useContext, useState, useEffect } from 'react'
import { useTheme } from '@material-ui/styles'
import { ResponsiveBar } from '@nivo/bar'
import ChartTooltip from '../Tooltip/ChartTooltip'
import { Card, CardHeader, CardContent } from '@material-ui/core'
import { StoreContext } from '../../contexts/StoreContext'
import { CircularLoader } from '../Progress/Progress'

Array.prototype.countBy = function(prop) {
    return this.reduce(function(groups, item) {
        const val = item[prop]
        groups[val] = groups[val] || 0
        groups[val] += 1
        return groups
    }, {})
}

export const proposalsGroupedByStatusThenTic = props => {
    const [store, setStore] = useContext(StoreContext)
    const [proposalGroups, setProposalGroups] = useState()
    const theme = useTheme()

    useEffect(() => {
        if (store.proposals && store.statuses) {
            const statuses = store.statuses.map(({ description }) => ({ name: description, proposals: [] }))
            store.proposals.forEach(proposal => {
                const index = statuses.findIndex(({ name }) => name === proposal.proposalStatus)
                if (index >= 0) statuses[index].proposals.push(proposal)
            })
            setProposalGroups(statuses.map(status => ({ name: status.name, ...status.proposals.countBy('assignToInstitution') })))
        }
    }, [store])

    return (
        <Card>
            <CardHeader title="Grouped by Status" subheader="" />
            <CardContent style={{ height: '450px' }}>
                {
                    (proposalGroups && store.tics) ? (
                        <ResponsiveBar
                            data={ proposalGroups }
                            keys={ store.tics.map(({ name }) => name) }
                            indexBy='name'
                            margin={{ top: 0, right: 32, bottom: 0, left: 265 }}
                            padding={ 0.05 }
                            groupMode='stacked'
                            layout='horizontal'
                            height={ 430 }
                            colors={ theme.palette.chartColors }
                            colorBy='id'
                            borderColor='inherit:darker(1.6)'
                            axisBottom={ null }
                            axisLeft={{
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
                            legends={ [{
                                    dataFrom: 'keys',
                                    anchor: 'top-right',
                                    direction: 'column',
                                    justify: false,
                                    translateX: 32,
                                    translateY: 0,
                                    itemsSpacing: 2,
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
                            }
                            tooltip={ ({ id, value, color, indexValue}) => (
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
