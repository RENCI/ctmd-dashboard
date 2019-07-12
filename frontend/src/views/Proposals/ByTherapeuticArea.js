import React, { useState, useEffect, useContext, useRef } from 'react'
import { StoreContext } from '../../contexts/StoreContext'
import { Heading } from '../../components/Typography/Typography'
import BrowseMenu from '../../components/Menus/BrowseMenu'
import { Grid, Card, CardHeader, CardContent } from '@material-ui/core'
import ProposalsPieChart from '../../components/Charts/ProposalsPie'
import ProposalsBarChart from '../../components/Charts/ProposalsBar'
import { CircularLoader } from '../../components/Progress/Progress'
import ProposalsTable from '../../components/Tables/ProposalsTable'
import ChartOptions from '../../components/Menus/ChartOptions'
import { SettingsContext } from '../../contexts/SettingsContext'

export const ProposalsByTherapeuticArea = props => {
    const [store, ] = useContext(StoreContext)
    const [settings] = useContext(SettingsContext)
    const [proposalsByTherapeuticArea, setProposalsByTherapeuticArea] = useState()
    const [displayedProposals, setDisplayedProposals] = useState()
    const [tableTitle, setTableTitle] = useState('')
    const [chartType, setChartType] = useState('pie')
    const [chartSorting, setChartSorting] = useState('alpha')
    const [hideEmptyGroups, setHideEmptyGroups] = useState(settings.charts.hideEmptyGroups)
    const tableRef = useRef(null)
    
    useEffect(() => {
        if (store.proposals && store.therapeuticAreas) {
            let areas = store.therapeuticAreas.map(({ description }) => ({ name: description, proposals: [] }))
            store.proposals.forEach(proposal => {
                const index = areas.findIndex(({ name }) => name === proposal.therapeuticArea)
                if (index >= 0) areas[index].proposals.push(proposal)
            })
            if (hideEmptyGroups) areas = areas.filter(area => area.proposals.length > 0)
            setProposalsByTherapeuticArea(areas)
        }
    }, [store, hideEmptyGroups])

    const selectProposals = (props) => {
        if (props.data) props = props.data  // Patch for issue #23
        const index = proposalsByTherapeuticArea.findIndex(area => area.name === props.id)
        setTableTitle('Therapeutic Area: ' + props.id)
        setDisplayedProposals(proposalsByTherapeuticArea[index].proposals)
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
                Proposals by Therapeutic Area
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
                                proposalsByTherapeuticArea && chartType === 'pie'
                                && <ProposalsPieChart proposals={ proposalsByTherapeuticArea } clickHandler={ selectProposals } height={ 600 } sorting={ chartSorting } />
                            }
                            {
                                proposalsByTherapeuticArea && chartType === 'bar'
                                && <ProposalsBarChart proposals={ proposalsByTherapeuticArea } clickHandler={ selectProposals } height={ 700 } sorting={ chartSorting } />
                            }
                            { !proposalsByTherapeuticArea && <CircularLoader /> }
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
