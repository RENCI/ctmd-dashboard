import React, { useState, useEffect, useContext, useRef } from 'react'
import { StoreContext } from '../../contexts/StoreContext'
import Heading from '../../components/Typography/Heading'
import BrowseMenu from '../../components/Menus/BrowseMenu'
import { Grid, Card, CardHeader, CardContent } from '@material-ui/core'
import ProposalsPieChart from '../../components/Charts/ProposalsPie'
import ProposalsBarChart from '../../components/Charts/ProposalsBar'
import { CircularLoader } from '../../components/Progress/Progress'
import ProposalsTable from '../../components/Charts/ProposalsTable'
import ChartOptions from '../../components/Menus/ChartOptions'

const ProposalsByTherapeuticArea = props => {
    const [store, setStore] = useContext(StoreContext)
    const [proposalsByTherapeuticArea, setProposalsByTherapeuticArea] = useState()
    const [displayedProposals, setDisplayedProposals] = useState()
    const [tableTitle, setTableTitle] = useState('')
    const [chartType, setChartType] = useState('pie')
    const [chartSorting, setChartSorting] = useState('alpha')
    const tableRef = useRef(null)
    
    useEffect(() => {
        if (store.proposals && store.therapeuticAreas) {
            const areas = store.therapeuticAreas.map(({ description }) => ({ name: description, proposals: [] }))
            store.proposals.forEach(proposal => {
                const index = areas.findIndex(({ name }) => name === proposal.therapeuticArea)
                if (index >= 0) areas[index].proposals.push(proposal)
            })
            setProposalsByTherapeuticArea(areas)
        }
    }, [store])

    const selectProposals = ({ id }) => {
        const index = proposalsByTherapeuticArea.findIndex(area => area.name === id)
        setTableTitle('Therapeutic Area: ' + id)
        setDisplayedProposals(proposalsByTherapeuticArea[index].proposals)
        scrollToTable()
    }
    
    const handleSelectGraphType = (event, type) => setChartType(type)
    const handleSelectGraphSorting = (event, sorting) => setChartSorting(sorting)

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

export default ProposalsByTherapeuticArea