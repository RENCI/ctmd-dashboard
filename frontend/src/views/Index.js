import React from 'react'
import { makeStyles, useTheme } from '@material-ui/styles'
import { Grid } from '@material-ui/core'
import { Heading } from '../components/Typography/Typography'
import ProposalsByTicBarChart from '../components/widgets/ProposalsByTic'
import ProposalsCalendar from '../components/widgets/ProposalsCalendar'
import DayStats from '../components/widgets/DayStats'
import Counts from '../components/widgets/Counts'

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
    const theme = useTheme()
    const classes = useStyles()

    return (
        <div className={ classes.page }>

            <div className={ classes.pageTitle }>
                <Heading>Dashboard Home</Heading>
            </div>

            <Grid container spacing={ 2 * theme.spacing.unit }>
                <Grid item xs={ 12 } sm={ 11 }>
                    <Counts/>
                </Grid>
                <Grid item xs={ 12 } sm={ 11 }>
                    <ProposalsByTicBarChart />
                </Grid>
                <Grid item xs={ 12 } sm={ 11 }>
                    <DayStats />
                </Grid>
                <Grid item xs={ 12 } sm={ 11 } >
                    <ProposalsCalendar />
                </Grid>
            </Grid>
        </div>
    )
}

export default HomePage