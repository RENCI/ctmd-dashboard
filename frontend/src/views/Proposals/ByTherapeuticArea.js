import React, { useState, useEffect, useContext, useRef } from 'react'
import axios from 'axios'
import { ApiContext } from '../../contexts/ApiContext'
import Heading from '../../components/Typography/Heading'
import BrowseMenu from '../../components/Menus/BrowseMenu'
import { Grid, Card, CardHeader, CardContent } from '@material-ui/core'
import ProposalsPieChart from '../../components/Charts/ProposalsPie'
import ProposalsBarChart from '../../components/Charts/ProposalsBar'
import { CircularLoader } from '../../components/Progress/Progress'
import ProposalsTable from '../../components/Charts/ProposalsTable'
import ChartOptions from '../../components/Menus/ChartOptions'


const ProposalsByTherapeuticArea = props => {
    const [proposalsByTherapeuticArea, setProposalsByTherapeuticArea] = useState()
    const [proposals, setProposals] = useState()
    const [chartType, setChartType] = useState('pie')
    const [chartSorting, setChartSorting] = useState('alpha')
    const api = useContext(ApiContext)
    const tableRef = useRef(null)
    
    useEffect(() => {
        axios.get(api.proposalsByTherapeuticArea)
            // .then(response => setProposalsByTherapeuticArea(response.data)) // all
            .then(response => setProposalsByTherapeuticArea(response.data.filter(area => area.proposals.length > 0))) // non-empty areas
            .catch(error => console.log('Error', error))
    }, [])

    const selectProposals = ({ id }) => {
        const index = proposalsByTherapeuticArea.findIndex(status => status.name === id)
        setProposals(proposalsByTherapeuticArea[index].proposals)
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
                    <ProposalsTable proposals={ proposals } paging={ false } />
                </Grid>

            </Grid>

        </div>
    )
}

export default ProposalsByTherapeuticArea