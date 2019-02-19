import React, { useState, useEffect, useContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import axios from 'axios'
import { ApiContext } from '../../contexts/ApiContext'
import Heading from '../../components/Typography/Heading'
import classnames from 'classnames'
import { Grid, Card, CardContent } from '@material-ui/core'
import Subheading from '../../components/Typography/Subheading'
import ProposalsPieChart from '../../components/Charts/ProposalsPie'
import { CircularLoader } from '../../components/Progress/Progress'
import ProposalsTable from '../../components/Charts/ProposalsTable'

const styles = (theme) => ({
    page: {
        // ...theme.mixins.debug
    },
    pieChartContainer: {
        height: '700px',
    },
    table: {
        overflowY: 'scroll',
    },
})

const ProposalsByOrganization = (props) => {
    const { classes, theme } = props
    const [proposalsByOrganization, setProposalsByOrganization] = useState([])
    const [proposals, setProposals] = useState([])
    const api = useContext(ApiContext)
    
    const selectProposals = ({ id }) => {
        const index = proposalsByOrganization.findIndex(organization => organization.name === id)
        setProposals(proposalsByOrganization[index].proposals)
    }

    useEffect(() => {
        axios.get(api.proposalsByOrganization)
            .then((response) => setProposalsByOrganization(response.data))
            .catch(error => console.log('Error', error))
    }, [])

    return (
        <div>
            <Heading>Proposals by Submitting Institution</Heading>

            <Grid container spacing={ 16 }>
                <Grid item xs={ 12 }>
                    <Card>
                        <CardContent className={ classnames(classes.chartContainer, classes.pieChartContainer) }>
                            {
                                (proposalsByOrganization.length > 0)
                                ? <ProposalsPieChart
                                    proposals={ proposalsByOrganization }
                                    clickHandler={ selectProposals }
                                />
                                : <CircularLoader />
                            }
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={ 12 }>
                    {
                        proposals
                            ? <ProposalsTable
                                className={ classes.table }
                                proposals={ proposals }
                                paging={ false }
                            />
                            : null
                    }
                </Grid>
            </Grid>

        </div>
    )
}

export default withStyles(styles, { withTheme: true })(ProposalsByOrganization)
