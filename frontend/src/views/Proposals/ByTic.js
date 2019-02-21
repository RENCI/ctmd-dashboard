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
import ChartTypeMenu from '../../components/Menus/ChartType'

const useStyles = makeStyles(theme => ({
    page: { },
    chartContainer: {
        height: '700px',
    },
}))

const ProposalsByTic = props => {
    const classes = useStyles()
    const [proposalsByTic, setProposalsByTic] = useState()
    const [proposals, setProposals] = useState()
    const [chartType, setChartType] = useState('pie')
    const api = useContext(ApiContext)
    
    useEffect(() => {
        axios.get(api.proposalsByTic)
            .then(response => setProposalsByTic(response.data))
            .catch(error => console.log('Error', error))
    }, [])

    const selectProposals = ({ id }) => {
        const index = proposalsByTic.findIndex(status => status.name === id)
        setProposals(proposalsByTic[index].proposals)
    }
    
    const handleSelectGraphType = (event, type) => {
        setChartType(type)
    }

    return (
        <div>
            <Heading>Proposals by TIC/RIC</Heading>

            <Grid container>

                <Grid item xs={ 12 }>
                    <Card>
                        <CardHeader action={ <ChartTypeMenu selectHandler={ handleSelectGraphType } currentValue={ chartType } /> } />
                        <CardContent className={ classes.chartContainer }>
                            { proposalsByTic && chartType === 'pie' && <ProposalsPieChart proposals={ proposalsByTic } clickHandler={ selectProposals } /> }
                            { proposalsByTic && chartType === 'bar' && <ProposalsBarChart proposals={ proposalsByTic } clickHandler={ selectProposals } /> }
                            { !proposalsByTic && <CircularLoader /> }
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

export default ProposalsByTic