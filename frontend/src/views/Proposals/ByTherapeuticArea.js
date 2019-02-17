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

            <Card className={ classnames(classes.card) } square={ true }>
                <CardContent className={ classnames(classes.chartContainer, classes.pieChartContainer) }>
                    {
                        (proposalsByTherapeuticArea.length > 0)
                        ? 'Coming soon'
                        : <CircularLoader />
                    }
                </CardContent>
            </Card>

            {
                (proposals.length > 0) ? (
                    <Card className={ classnames(classes.card) } square={ true }>
                        <CardContent component={ ProposalsTable }
                            className={ classes.table }
                            data={ proposals }
                            paging={ false }
                        />
                    </Card>
                ) : null
            }

        </div>
    )
}

export default withStyles(styles, { withTheme: true })(ProposalsByTherapeuticArea)
