import React, { useState, useEffect, useContext } from 'react'
import classnames from 'classnames'
import axios from 'axios'
import { withStyles } from '@material-ui/core/styles'
import { Grid, Card, CardContent } from '@material-ui/core'
import { Button } from '@material-ui/core'
import Heading from '../components/Typography/Heading'
import Subheading from '../components/Typography/Subheading'
import { CircularLoader } from '../components/Progress/Progress'
import ProposalsByTicBarChart from '../components/Charts/ProposalsByTic'
import ProposalsByStatusBarChart from '../components/Charts/ProposalsByStatus'
import ProposalsCalendar from '../components/Charts/ProposalsCalendar'

import { ApiContext } from '../contexts/ApiContext'

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
    barChartContainer: {
        height: '700px',
        position: 'relative',
    },
    calendarContainer: {
        height: `calc(100vw * 30/55 + 64px)`,
        [theme.breakpoints.up('sm')]: {
            height: `calc((100vw - 240px) * 26/55 + 64px)`,
        }
    },
    pieChartContainer: {
        height: '700px',
    },
    groupingButtonsContainer: {
        textAlign: 'right',
        position: 'absolute',
        bottom: 3 * theme.spacing.unit,
        right: 1 * theme.spacing.unit,
    },
    groupingButton: {
        margin: `0 ${ theme.spacing.unit }px`
    },
})

const HomePage = (props) => {
    const { classes, theme } = props
    const [proposalsByTic, setProposalsByTic] = useState()
    const [proposalsByDate, setProposalsByDate] = useState()
    const [proposalsByStatus, setProposalsByStatus] = useState()
    const [statuses, setStatuses] = useState()
    const [tics, setTics] = useState()
    const api = useContext(ApiContext)

    useEffect(() => {
        const promises = [
            axios.get(api.proposalsByTic),
            axios.get(api.proposalsByDate),
            axios.get(api.proposalsByStatus),
            axios.get(api.statuses),
            axios.get(api.tics),
        ]
        Promise.all(promises)
            .then((response) => {
                setProposalsByTic(response[0].data)
                setProposalsByDate(response[1].data)
                setProposalsByStatus(response[2].data)
                setStatuses(response[3].data)
                setTics(response[4].data)
            })
            .catch(error => console.log('Error', error))
    }, [])

    return (
        <div className={ classes.page }>

            <div className={ classes.pageTitle }>
                <Heading>Dashboard Home</Heading>
            </div>

            <Grid container spacing={ 16 }>
                <Grid item xs={ 12 } sm={ 11 } xl={ 5 }>
                    {
                        (proposalsByTic && statuses)
                            ? <ProposalsByTicBarChart proposalsByTic={ proposalsByTic } statuses={ statuses.map(({ description }) => description) }/>
                            : <CircularLoader />
                    }
                </Grid>

                <Grid item xs={ 12 } sm={ 11 } xl={ 5 }>
                    {
                        (proposalsByStatus && tics)
                            ? <ProposalsByStatusBarChart proposalsByStatus={ proposalsByStatus } tics={ tics.map(({ description }) => description) }/>
                            : <CircularLoader />
                    }
                </Grid>

                <Grid item xs={ 12 } sm={ 11 } xl={ 6 }>
                    {
                        (proposalsByDate)
                            ? <ProposalsCalendar proposalsByDate={ proposalsByDate }/>
                            : <CircularLoader />
                    }
                </Grid>
            </Grid>

        </div>
    )
}

export default withStyles(styles, { withTheme: true })(HomePage)