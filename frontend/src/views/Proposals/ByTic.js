import React, { useState, useEffect, useContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import axios from 'axios'
import { ApiContext } from '../../contexts/ApiContext'
import Heading from '../../components/Typography/Heading'
import classnames from 'classnames'
import { Card, CardContent } from '@material-ui/core'
import OrgPieChart from '../../components/Charts/ProposalsPie'
import { CircularLoader } from '../../components/Progress/Progress'
import Subheading from '../../components/Typography/Subheading'
import ProposalsTable from '../../components/Charts/ProposalsTable'

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
    const api = useContext(ApiContext)

    const selectProposals = ({ id }) => {
        const index = proposalsByTic.findIndex(tic => tic.name === id)
        setProposals(proposalsByTic[index].proposals)
    }
    
    useEffect(() => {
        axios.get(api.proposalsByTic)
            .then(response => setProposalsByTic(response.data))
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

export default withStyles(styles, { withTheme: true })(ProposalsByTic)
