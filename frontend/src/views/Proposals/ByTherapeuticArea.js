import React, { useState, useEffect, useContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import classnames from 'classnames'
import axios from 'axios'
import { ApiContext } from '../../contexts/ApiContext'
import Heading from '../../components/Typography/Heading'
import Subheading from '../../components/Typography/Subheading'
import { Grid, Card, CardContent } from '@material-ui/core'
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

const ProposalsByTherapeuticArea = (props) => {
    const { classes, theme } = props
    const [proposalsByTherapeuticArea, setProposalsByTherapeuticArea] = useState([])
    const [proposals, setProposals] = useState([])
    const api = useContext(ApiContext)
    
    const selectProposals = ({ id }) => {
        const index = proposalsByTherapeuticArea.findIndex(status => status.name === id)
        setProposals(proposalsByTherapeuticArea[index].proposals)
    }

    useEffect(() => {
        axios.get(api.proposalsByTherapeuticArea)
            .then(response => setProposalsByTherapeuticArea(response.data))
            .catch(error => console.log('Error', error))
    }, [])

    return (
        <div>
            <Heading>Proposals by Therapeutic Area</Heading>

            <Grid container spacing={ 16 }>
                <Grid item xs={ 12 }>
                    <Card>
                        <CardContent className={ classes.pieChartContainer }>
                            {
                                proposalsByTherapeuticArea
                                ? <ProposalsPieChart
                                    proposals={ proposalsByTherapeuticArea }
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

export default withStyles(styles, { withTheme: true })(ProposalsByTherapeuticArea)
