import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { makeStyles, useTheme } from '@material-ui/styles'
import { Grid } from '@material-ui/core'
import Heading from '../components/Typography/Heading'
import { CircularLoader } from '../components/Progress/Progress'
import ProposalsByTicBarChart from '../components/Charts/ProposalsByTic'
import ProposalsByStatusBarChart from '../components/Charts/ProposalsByStatus'
import ProposalsCalendar from '../components/Charts/ProposalsCalendar'
import AverageDays from '../components/Charts/AverageDays'

import { ApiContext } from '../contexts/ApiContext'

const useStyles = makeStyles(theme => ({
    page: { },
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
}))

const HomePage = (props) => {
    const [proposals, setProposals] = useState()
    const [proposalsByTic, setProposalsByTic] = useState()
    const [proposalsByDate, setProposalsByDate] = useState()
    const [proposalsByStatus, setProposalsByStatus] = useState()
    const [statuses, setStatuses] = useState()
    const [tics, setTics] = useState()
    const api = useContext(ApiContext)
    const theme = useTheme()
    const classes = useStyles()

    useEffect(() => {
        const promises = [
            axios.get(api.proposals),
            axios.get(api.proposalsByTic),
            axios.get(api.proposalsByDate),
            axios.get(api.proposalsByStatus),
            axios.get(api.statuses),
            axios.get(api.tics),
        ]
        Promise.all(promises)
            .then((response) => {
                setProposals(response[0].data)
                setProposalsByTic(response[1].data)
                setProposalsByDate(response[2].data)
                setProposalsByStatus(response[3].data)
                setStatuses(response[4].data)
                setTics(response[5].data)
            })
            .catch(error => console.log('Error', error))
    }, [])

    return (
        <div className={ classes.page }>

            <div className={ classes.pageTitle }>
                <Heading>Dashboard Home</Heading>
            </div>

            <Grid container spacing={ 2 * theme.spacing.unit }>
                <Grid item xs={ 12 } sm={ 11 } lg={ 6 }>
                    {
                        (proposalsByTic && statuses)
                            ? <ProposalsByTicBarChart proposalsByTic={ proposalsByTic } statuses={ statuses.map(({ description }) => description) }/>
                            : <CircularLoader />
                    }
                </Grid>

                <Grid item xs={ 12 } sm={ 11 } lg={ 6 }>
                    {
                        (proposalsByStatus && tics)
                            ? <ProposalsByStatusBarChart proposalsByStatus={ proposalsByStatus } tics={ tics.map(({ name }) => name) }/>
                            : <CircularLoader />
                    }
                </Grid>

                <Grid item xs={ 12 } sm={ 11 } lg={ 7 }>
                    {
                        (proposalsByDate)
                            ? <ProposalsCalendar proposalsByDate={ proposalsByDate }/>
                            : <CircularLoader />
                    }
                </Grid>

                <Grid item xs={ 12 } sm={ 11 } lg={ 5 }>
                    {
                        (proposalsByDate)
                            ? <AverageDays proposals={ proposals }/>
                            : <CircularLoader />
                    }
                </Grid>
            </Grid>

        </div>
    )
}

export default HomePage