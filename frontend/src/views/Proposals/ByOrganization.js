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

const ProposalsByOrganization = props => {
    const classes = useStyles()
    const [proposalsByOrganization, setProposalsByOrganization] = useState()
    const [proposals, setProposals] = useState()
    const [chartType, setChartType] = useState('pie')
    const api = useContext(ApiContext)
    
    useEffect(() => {
        axios.get(api.proposalsByOrganization)
            .then((response) => setProposalsByOrganization(response.data))
            .catch(error => console.log('Error', error))
    }, [])

    const selectProposals = ({ id }) => {
        const index = proposalsByOrganization.findIndex(organization => organization.name === id)
        setProposals(proposalsByOrganization[index].proposals)
    }
    
    const handleSelectGraphType = (event, type) => {
        setChartType(type)
    }

    return (
        <div>
            <Heading>Proposals by Submitting Institution</Heading>

            <Grid container spacing={ 16 }>
                <Grid item xs={ 12 }>
                    <Card>
                        <CardHeader action={ <ChartTypeMenu selectHandler={ handleSelectGraphType } currentValue={ chartType } /> } />
                        <CardContent className={ classes.chartContainer }>
                            {
                                proposalsByOrganization && chartType === 'pie'
                                    ? <ProposalsPieChart proposals={ proposalsByOrganization } clickHandler={ selectProposals } />
                                    : <CircularLoader />
                            }
                            {
                                proposalsByOrganization && chartType === 'bar'
                                    ? <ProposalsBarChart proposals={ proposalsByOrganization } clickHandler={ selectProposals } />
                                    : <CircularLoader />
                            }
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

export default ProposalsByOrganization