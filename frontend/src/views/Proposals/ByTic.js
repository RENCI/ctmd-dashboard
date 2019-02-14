import React, { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import axios from 'axios'
import Heading from '../../components/Typography/Heading'
import classnames from 'classnames'
import { Card, CardContent } from '@material-ui/core'
import OrgPieChart from '../../components/Charts/ProposalsPie'
import { CircularLoader } from '../../components/Progress/Progress'
import Subheading from '../../components/Typography/Subheading'
import MaterialTable from 'material-table'

const apiRoot = (process.env.NODE_ENV === 'production') ? 'https://pmd.renci.org/api/' : 'http://localhost:3030/'
const apiUrl = {
    proposalsByTic: apiRoot + 'proposals/by-tic',
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
        overflowY: 'scroll',
    },
})

const ProposalsByTic = (props) => {
    const { classes, theme } = props
    const [proposalsByTic, setProposalsByTic] = useState([])
    const [proposals, setProposals] = useState([])
    
    const selectProposals = ({ id }) => {
        const index = proposalsByTic.findIndex(tic => tic.name === id)
        setProposals(proposalsByTic[index].proposals)
    }

    useEffect(() => {
        axios.get(apiUrl.proposalsByTic)
            .then((response) => setProposalsByTic(response.data))
            .catch(error => console.log('Error', error))
    }, [])

    return (
        <div>
            <Heading>Proposals by Assigned TIC/RIC</Heading>

            <Card className={ classnames(classes.card) } square={ true }>
                <CardContent className={ classnames(classes.chartContainer, classes.pieChartContainer) }>
                    {
                        (proposalsByTic.length > 0)
                        ? <OrgPieChart
                            proposals={ proposalsByTic }
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
                        <CardContent className={ classes.table } component={ MaterialTable }
                            columns={ [
                                { title: 'Proposal ID', field: 'proposal_id', },
                                { title: 'Proposal Name', field: 'short_name', },
                                { title: 'TIC', field: 'tic_name', },
                                { title: 'Organization', field: 'org_name', },
                                { title: 'Submission Date', field: 'prop_submit', type: 'datetime', render: ({submission_date}) => <span>{ submission_date }</span>},
                            ] }
                            data={ proposals }
                            options={{
                                columnsButton: true,
                                exportButton: true,
                                paging: false,
                            }}
                            title=""
                        />
                    </Card>
                ) : null
            }

        </div>
    )
}

export default withStyles(styles, { withTheme: true })(ProposalsByTic)
