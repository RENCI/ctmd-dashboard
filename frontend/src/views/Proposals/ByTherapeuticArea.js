import React, { Fragment, useState, useEffect, useContext } from 'react'
import { makeStyles } from '@material-ui/styles'
import axios from 'axios'
import { ApiContext } from '../../contexts/ApiContext'
import Heading from '../../components/Typography/Heading'
import { Grid, Card, CardHeader, CardContent, Menu, MenuItem, IconButton } from '@material-ui/core'
import {
    MoreVert as MoreIcon,
    Sort as SizeSortIcon,
    SortByAlpha as AlphaSortIcon,
} from '@material-ui/icons'
import ProposalsPieChart from '../../components/Charts/ProposalsPie'
import ProposalsBarChart from '../../components/Charts/ProposalsBar'
import { CircularLoader } from '../../components/Progress/Progress'
import ProposalsTable from '../../components/Charts/ProposalsTable'
import ChartOptions from '../../components/Menus/ChartOptions'

const useStyles = makeStyles(theme => ({
    page: { },
    chartContainer: {
        height: '700px',
    },
}))

const ProposalsByTherapeuticArea = props => {
    const classes = useStyles()
    const [proposalsByTherapeuticArea, setProposalsByTherapeuticArea] = useState()
    const [proposals, setProposals] = useState()
    const [chartType, setChartType] = useState('pie')
    const [chartSorting, setChartSorting] = useState('alpha')
    const api = useContext(ApiContext)
    
    useEffect(() => {
        axios.get(api.proposalsByTherapeuticArea)
            // .then(response => setProposalsByTherapeuticArea(response.data)) // all
            .then(response => setProposalsByTherapeuticArea(response.data.filter(area => area.proposals.length > 0))) // non-empty areas
            .catch(error => console.log('Error', error))
    }, [])

    const selectProposals = ({ id }) => {
        const index = proposalsByTherapeuticArea.findIndex(status => status.name === id)
        setProposals(proposalsByTherapeuticArea[index].proposals)
    }
    
    const handleSelectGraphType = (event, type) => setChartType(type)
    const handleSelectGraphSorting = (event, sorting) => setChartSorting(sorting)

    return (
        <div>
            <Heading>Proposals by Therapeutic Area</Heading>

            <Grid container>

                <Grid item xs={ 12 }>
                    <Card>
                        <CardHeader action={
                            <ChartOptions
                                sortingSelectionHandler={ handleSelectGraphSorting } currentSorting={ chartSorting }
                                typeSelectionHandler={ handleSelectGraphType } currentType={ chartType }
                            />
                        } />
                        <CardContent className={ classes.chartContainer }>
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
                    <ProposalsTable proposals={ proposals } paging={ false } />
                </Grid>

            </Grid>

        </div>
    )
}

export default ProposalsByTherapeuticArea