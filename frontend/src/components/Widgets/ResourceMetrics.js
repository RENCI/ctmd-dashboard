import React, { useContext, useState, useEffect } from 'react'
import { useTheme } from '@material-ui/styles'
import { ResponsiveBar } from '@nivo/bar'
import { ChartTooltip } from '../Tooltip'
import { StoreContext } from '../../contexts/StoreContext'
import { CircularLoader } from '../Progress/Progress'
import { Widget } from './Widget'

export const ResourceMetrics = props => {
    const [store, ] = useContext(StoreContext)
    const [resources, setResources] = useState(null)
    const [proposals, setProposals] = useState(null)
    const [metrics, setMetrics] = useState(null)
    const theme = useTheme()

    const funded = proposal => {
      return proposal.fundingStatus === "Funded (study funded)"
    }

    const requestedResource = (proposal, resource) => {
      return proposal.requestedServices.indexOf(resource) !== -1
    }

    const approvedResource = (proposal, resource) => {
      return proposal.approvedServices.indexOf(resource) !== -1
    }

    useEffect(() => {
        setResources(store.services)
    })

    useEffect(() => {
        setProposals(store.proposals)
    }, [store])

    useEffect(() => {
        if (resources && proposals) {
            setMetrics(resources.map(resource => {
                const resourceMetrics = {
                    Resource: resource,
                    Requested: proposals.reduce((count, proposal) => {
                      return requestedResource(proposal, resource) ? count + 1 : count
                    }, 0),
                    Approved: proposals.reduce((count, proposal) => {
                        return approvedResource(proposal, resource) ? count + 1 : count
                    }, 0),
                    Funded: proposals.reduce((count, proposal) => {
                        return requestedResource(proposal, resource) && funded(proposal) ? count + 1 : count
                    }, 0)
                }

                const minValue = 0.5
                if (resourceMetrics.Requested === 0) resourceMetrics.Requested = minValue
                if (resourceMetrics.Approved === 0) resourceMetrics.Approved = minValue
                if (resourceMetrics.Funded === 0) resourceMetrics.Funded = minValue

                return resourceMetrics
            }))
        }
    }, [resources, proposals])


    console.log(store)
    console.log(metrics);

    const fstatus = {};
    const pstatus = {};
    if (proposals) {
        proposals.forEach(p => {
            pstatus[p.proposalStatus] = 1
            fstatus[p.fundingStatus] = 1
        })
    }
    console.log(fstatus);
    console.log(pstatus);


    const chartLegends = [{
        enableLabel: false,
        dataFrom: 'keys',
        anchor: 'top-right',
        direction: 'column',
        justify: false,
        translateX: 100,
        translateY: 0,
        itemsSpacing: 1,
        itemWidth: 20,
        itemHeight: 20,
        itemDirection: 'right-to-left',
        itemOpacity: 1,
        symbolSize: 20
    }]

    return (
        <Widget
            title="Resource Metrics"
        >
            <div style={{ height: '284px' }}>
                {
                    metrics ? (
                        <ResponsiveBar
                            data={ metrics }
                            indexBy={ 'Resource' }
                            keys={ ['Requested', 'Approved', 'Funded'] }
                            groupMode={ 'grouped' }
                            padding={ 0.25 }
                            margin={{ top: 0, right: 150, bottom: 100, left: 0 }}
                            colors={ theme.palette.chartColors }
                            colorBy='id'
                            label={ d => d.value < 1 ? '' : d.value }
                            enableGridY={ false }
                            enableGridX={ false }
                            axisTop={ null }
                            axisRight={ null }
                            axisLeft={ null }
                            axisBottom={{
                                tickSize: 5,
                                tickPadding: 5,
                                tickRotation: 15,
                                legend: ''
                            }}
                            legends={ chartLegends }
                            tooltip={ ({ id, value, color, indexValue }) => (
                                <ChartTooltip color={ color }>
                                    <div><strong>{ indexValue }</strong></div>
                                    <div>
                                        {
                                            id === 'Requested' ?  'Requested by ' + value + ' proposals' :
                                            id === 'Approved' ? 'Approved for ' + value + ' proposals' :
                                            id === 'Funded' ? value + ' proposals with request were funded' :
                                            ''
                                        }
                                    </div>
                                </ChartTooltip>
                            )}
                        />
                    ) : <CircularLoader />
                }
            </div>
        </Widget>
    )
}
