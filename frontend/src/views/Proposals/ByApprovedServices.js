import React, { useState, useEffect, useContext, useRef } from 'react'
import { StoreContext } from '../../contexts/StoreContext'
import { Heading } from '../../components/Typography'
import { BrowseMenu, ChartOptions } from '../../components/Menus'
import { Grid, Card, CardHeader, CardContent } from '@material-ui/core'
import { ProposalsPieChart, ProposalsBarChart } from '../../components/Charts'
import { CircularLoader } from '../../components/Progress/Progress'
import { ProposalsTable } from '../../components/Tables'
import { SettingsContext } from '../../contexts/SettingsContext'

export const ProposalsByApprovedServices = props => {
    const [store, ] = useContext(StoreContext)
    const [settings] = useContext(SettingsContext)
    const [proposalsByApprovedServices, setProposalsByApprovedServices] = useState()
    const [displayedProposals, setDisplayedProposals] = useState()
    const [tableTitle, setTableTitle] = useState('')
    const [chartType, setChartType] = useState('pie')
    const [chartSorting, setChartSorting] = useState('alpha')
    const [hideEmptyGroups, setHideEmptyGroups] = useState(settings.charts.hideEmptyGroups)
    const tableRef = useRef(null)
    
    useEffect(() => {
        if (store.proposals && store.services) {
            let services = store.services.map(service => ({ name: service, proposals: [] }))
            store.proposals.forEach(proposal => {
                proposal.approvedServices.forEach(service => {
                    const index = services.findIndex(({ name }) => service === name)
                    if (index >= 0) {
                        services[index].proposals.push(proposal)
                    }
                })
            })
            if (hideEmptyGroups) services = services.filter(service => service.proposals.length > 0)
            setProposalsByApprovedServices(services)
        }
    }, [store, hideEmptyGroups])

    const selectProposals = ({ id }) => {
        const index = proposalsByApprovedServices.findIndex(service => service.name === id)
        setTableTitle('Approved Services: ' + id)
        setDisplayedProposals(proposalsByApprovedServices[index].proposals)
        scrollToTable()
    }

    const handleSelectGraphType = (event, type) => setChartType(type)
    const handleSelectGraphSorting = (event, sorting) => setChartSorting(sorting)
    const handleToggleHideEmptyGroups = event => setHideEmptyGroups(event.target.checked)
    
    const scrollToTable = () => {
        setTimeout(() => tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 500)
    }

    return (
        <div>
            <Heading>
                Proposals by Approved Services
                <BrowseMenu />
            </Heading>

            <Grid container>

                <Grid item xs={ 12 }>
                    <Card>
                        <CardHeader action={
                            <ChartOptions
                                sortingSelectionHandler={ handleSelectGraphSorting } currentSorting={ chartSorting }
                                typeSelectionHandler={ handleSelectGraphType } currentType={ chartType }
                                toggleHideEmptyGroupsHandler={ handleToggleHideEmptyGroups } hideEmptyGroups={ hideEmptyGroups }
                            />
                        } />
                        <CardContent>
                            {
                                proposalsByApprovedServices && chartType === 'pie'
                                && <ProposalsPieChart proposals={ proposalsByApprovedServices } clickHandler={ selectProposals } height={ 600 } sorting={ chartSorting } />
                            }
                            {
                                proposalsByApprovedServices && chartType === 'bar'
                                && <ProposalsBarChart proposals={ proposalsByApprovedServices } clickHandler={ selectProposals } height={ 700 } sorting={ chartSorting } />
                            }
                            { !proposalsByApprovedServices && <CircularLoader /> }
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={ 12 }>
                    <div ref={ tableRef }></div>
                    <ProposalsTable title={ tableTitle } proposals={ displayedProposals } paging={ false } />
                </Grid>

            </Grid>

        </div>
    )
}
