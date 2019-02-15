import React, { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import axios from 'axios'
import Heading from '../../components/Typography/Heading'
import classnames from 'classnames'
import { Card, CardContent } from '@material-ui/core'
import OrgPieChart from '../../components/Charts/ProposalsPie'
import { CircularLoader } from '../../components/Progress/Progress'
import Subheading from '../../components/Typography/Subheading'
import ProposalsTable from '../../components/Charts/ProposalsTable'

const apiRoot = (process.env.NODE_ENV === 'production') ? 'https://pmd.renci.org/api/' : 'http://localhost:3030/'
const apiUrl = {
    proposals: apiRoot + 'proposals',
    proposalsByStatus: apiRoot + 'proposals/by-status',
}

const styles = (theme) => ({
    page: {
        // ...theme.mixins.debug
    },
    card: {
        marginBottom: 2 * theme.spacing.unit,
        backgroundColor: theme.palette.grey[100],
    },
    chartContainer: {
        padding: 4 * theme.spacing.unit,
        width: 'calc(100vw - 48px)',
        [theme.breakpoints.up('sm')]: {
            width: 'calc(100vw - 240px - 86px)',
        },
    },
    pieChartContainer: {
        height: '700px',
    },
    table: {
        padding: 2 * theme.spacing.unit,
    },
})

const ProposalsByStatus = (props) => {
    const { classes, theme } = props
    const [proposalsByStatus, setProposalsByStatus] = useState([])
    const [proposals, setProposals] = useState([])
    
    const selectProposals = ({ id }) => {
        const index = proposalsByStatus.findIndex(status => status.name === id)
        setProposals(proposalsByStatus[index].proposals)
    }

    useEffect(() => {
        axios.get(apiUrl.proposalsByStatus)
            .then((response) => setProposalsByStatus(response.data))
            .catch(error => console.log('Error', error))
    }, [])

    return (
        <div>
            <Heading>Proposals by Current Status</Heading>

            <Card className={ classnames(classes.card) } square={ true }>
                <CardContent className={ classnames(classes.chartContainer, classes.pieChartContainer) }>
                    {
                        (proposalsByStatus.length > 0)
                        ? <OrgPieChart
                            proposals={ proposalsByStatus }
                            colors={ Object.values(theme.palette.extended).splice(0, 9) }
                            clickHandler={ selectProposals }
                        />
                        : <CircularLoader />
                    }
                </CardContent>
            </Card>

            {
                (proposals.length > 0) ? (
                    <Card className={ classnames(classes.card) } square={ true }>
                        <CardContent component={ ProposalsTable }
                            className={ classes.table }
                            proposals={ proposals }
                            paging={ false }
                        />
                    </Card>
                ) : null
            }

        </div>
    )
}

export default withStyles(styles, { withTheme: true })(ProposalsByStatus)
