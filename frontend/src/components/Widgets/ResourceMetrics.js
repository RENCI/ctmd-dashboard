import React, { useContext, useState, useEffect } from 'react'
import { useTheme } from '@material-ui/styles'
import { ResponsiveBar } from '@nivo/bar'
import { Typography } from '@material-ui/core'
import { ChartTooltip } from '../Tooltip'
import { StoreContext } from '../../contexts/StoreContext'
import { CircularLoader } from '../Progress/Progress'
import { Widget } from './Widget'
import { ProposalsTable } from '../Tables/ProposalsTable'

export const ResourceMetrics = props => {
    const [store, ] = useContext(StoreContext)
    const [resources, setResources] = useState(null)
    const [proposals, setProposals] = useState(null)
    const [requestedMetrics, setRequestedMetrics] = useState(null)
    const [approvedMetrics, setApprovedMetrics] = useState(null)
    const [maxValue, setMaxValue] = useState(0)
    const [selectedProposals, setSelectedProposals] = useState([])
    const [selectedNode, setSelectedNode] = useState(null)
    const theme = useTheme()

    const funded = ({ fundingStatus }) => {
      return fundingStatus === 'Funded (study funded)'
    }

    const notFunded = ({ proposalStatus }) => {
      return proposalStatus === 'Not Approved' || proposalStatus === 'Withdrawn by PI'
    }

    const requestedResource = (proposal, resource) => {
      return proposal.requestedServices.indexOf(resource) !== -1
    }

    const approvedResource = (proposal, resource) => {
      return proposal.approvedServices.indexOf(resource) !== -1
    }

    const createMetrics = hasResource => {
        return resources.map(resource => {
            const fundedProposals = []
            const pendingProposals = []
            const notFundedProposals = []

            proposals.forEach(proposal => {
                if (!hasResource(proposal, resource)) return

                if (funded(proposal)) fundedProposals.push(proposal)
                else if (notFunded(proposal)) notFundedProposals.push(proposal)
                else pendingProposals.push(proposal)
            })

            const resourceMetrics = {
                Resource: resource,
                Funded: fundedProposals.length,
                fundedProposals: fundedProposals,
                Pending: pendingProposals.length,
                pendingProposals: pendingProposals,
                notFundedProposals: notFundedProposals
            }

            resourceMetrics['Not Funded'] = notFundedProposals.length

            const minValue = 0.5
            if (resourceMetrics.Funded === 0) resourceMetrics.Funded = minValue
            if (resourceMetrics.Pending === 0) resourceMetrics.Pending = minValue
            if (resourceMetrics['Not Funded'] === 0) resourceMetrics['Not Funded'] = minValue

            return resourceMetrics
        })
    }

    useEffect(() => {
        setResources(store.services)
    })

    useEffect(() => {
        setProposals(store.proposals)
    }, [store])

    useEffect(() => {
        if (resources && proposals) {
            setRequestedMetrics(createMetrics(requestedResource))
            setApprovedMetrics(createMetrics(approvedResource))
        }
    }, [resources, proposals])

    useEffect(() => {
        if (requestedMetrics && approvedMetrics) {
            setMaxValue(requestedMetrics.concat(approvedMetrics).reduce((value, resource) => {
                return Math.max(value, resource.Funded, resource.Pending, resource['Not Funded'])
            }, 0))
        }
    }, [requestedMetrics, approvedMetrics])

    const tableTitle = () => {
      if (!selectedNode) return 'No Selected Proposals'

      const type = requestedMetrics && requestedMetrics.indexOf(selectedNode.data) !== -1 ? 'Requested' :
          approvedMetrics && approvedMetrics.indexOf(selectedNode.data) !== -1 ? 'Approved' : null;

      if (!type) return ''

      return type + ': ' + selectedNode.indexValue + ", " + selectedNode.id
    }

    const handleClick = (node, event) => {
        setSelectedProposals(
            node.id === "Pending" ? node.data.pendingProposals :
            node.id === "Funded" ? node.data.fundedProposals :
            node.id === "Not Funded" ? node.data.notFundedProposals :
            []
        )

        setSelectedNode(node)
    }

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

    const tooltip = type => {
        return ({ id, value, color, indexValue }) => {
            const idText =
                id === 'Pending' ? 'pending' :
                id === 'Funded' ? 'funded' :
                id === 'Not Funded' ? 'non-funded' :
                ''

            const proposalText = 'proposal' + (value === 1 ? '' : 's')

            return (
                <ChartTooltip color={ color }>
                    <div><strong>{ indexValue }</strong></div>
                    <div>{ type + ' ' + value + ' ' + idText + ' ' + proposalText }</div>
                </ChartTooltip>
            )
        }
    }

    const isSelected = d => {
        return selectedNode && selectedNode.data === d.data.data && selectedNode.id === d.data.id
    }

    return (
        <Widget
            title="Resource Metrics"
        >
            <>
                  <Typography variant="h4">Requested Resources</Typography>
                  <br/><br/>
                  <div style={{ height: '200px' }}>
                      {
                          requestedMetrics ? (
                              <ResponsiveBar
                                  data={ requestedMetrics }
                                  indexBy={ 'Resource' }
                                  keys={ ['Pending', 'Funded', 'Not Funded'] }
                                  groupMode={ 'grouped' }
                                  maxValue={ maxValue }
                                  padding={ 0.25 }
                                  innerPadding={ 1 }
                                  margin={{ top: 1, right: 150, bottom: 100, left: 1 }}
                                  colors={ theme.palette.chartColors }
                                  colorBy='id'
                                  borderWidth={ 2 }
                                  borderColor={ d => isSelected(d) ? "black" : "none" }
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
                                  onClick={ handleClick }
                                  tooltip={ tooltip("Requested by") }
                              />
                          ) : <CircularLoader />
                      }
                  </div>
                  <Typography variant="h4">Approved Resources</Typography>
                  <br/><br/>
                  <div style={{ height: '200px' }}>
                      {
                          requestedMetrics ? (
                              <ResponsiveBar
                                  data={ approvedMetrics }
                                  indexBy={ 'Resource' }
                                  keys={ ['Pending', 'Funded', 'Not Funded'] }
                                  groupMode={ 'grouped' }
                                  maxValue={ maxValue }
                                  padding={ 0.25 }
                                  innerPadding={ 1 }
                                  margin={{ top: 1, right: 150, bottom: 100, left: 1 }}
                                  margin={{ top: 0, right: 150, bottom: 100, left: 0 }}
                                  colors={ theme.palette.chartColors }
                                  colorBy='id'
                                  borderWidth={ 2 }
                                  borderColor={ d => isSelected(d) ? "black" : "none" }
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
                                  tooltip={ tooltip("Approved for") }
                                  onClick={ handleClick }
                              />
                          ) : <CircularLoader />
                      }
                  </div>
                  <ProposalsTable
                      title={ tableTitle() }
                      proposals={ selectedProposals }
                  />
              </>
        </Widget>
    )
}
