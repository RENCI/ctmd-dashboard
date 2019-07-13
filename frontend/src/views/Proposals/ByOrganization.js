import React, { useState, useEffect, useContext, useRef } from 'react'
import { StoreContext } from '../../contexts/StoreContext'
import { Title } from '../../components/Typography'
import { BrowseMenu, ChartOptions } from '../../components/Menus'
import { Grid, Card, CardHeader, CardContent } from '@material-ui/core'
import { ProposalsPieChart, ProposalsBarChart } from '../../components/Charts'
import { CircularLoader } from '../../components/Progress/Progress'
import { ProposalsTable } from '../../components/Tables'
import { SettingsContext } from '../../contexts/SettingsContext'

export const ProposalsByOrganization = props => {
    const [store, ] = useContext(StoreContext)
    const [settings] = useContext(SettingsContext)
    const [proposalsByOrganization, setProposalsByOrganization] = useState()
    const [displayedProposals, setDisplayedProposals] = useState()
    const [tableTitle, setTableTitle] = useState('')
    const [chartType, setChartType] = useState('pie')
    const [chartSorting, setChartSorting] = useState('alpha')
    const [hideEmptyGroups, setHideEmptyGroups] = useState(settings.charts.hideEmptyGroups)
    const tableRef = useRef(null)
    
    useEffect(() => {
        if (store.proposals && store.organizations) {
            let orgs = store.organizations.map(({ description }) => ({ name: description, proposals: [] }))
            store.proposals.forEach(proposal => {
                const index = orgs.findIndex(({ name }) => name === proposal.submitterInstitution)
                if (index >= 0) orgs[index].proposals.push(proposal)
            })
            if (hideEmptyGroups) orgs = orgs.filter(org => org.proposals.length > 0)
            setProposalsByOrganization(orgs)
        }
    }, [store, hideEmptyGroups])

    const selectProposals = (props) => {
        if (props.data) props = props.data  // Patch for issue #23
        const index = proposalsByOrganization.findIndex(org => org.name === props.id)
        setTableTitle('Submitting Institution: ' + props.id)
        setDisplayedProposals(proposalsByOrganization[index].proposals)
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
            <Title>
                Proposals by Submitting Institution
                <BrowseMenu />
            </Title>

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
                                proposalsByOrganization && chartType === 'pie'
                                && <ProposalsPieChart proposals={ proposalsByOrganization } clickHandler={ selectProposals } height={ 600 } sorting={ chartSorting } />
                            }
                            {
                                proposalsByOrganization && chartType === 'bar'
                                && <ProposalsBarChart proposals={ proposalsByOrganization } clickHandler={ selectProposals } height={ 700 } sorting={ chartSorting } />
                            }
                            { !proposalsByOrganization && <CircularLoader /> }
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
