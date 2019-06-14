import React from 'react'
import { /* makeStyles, */ useTheme } from '@material-ui/styles'
import { Grid } from '@material-ui/core'
import { Heading } from '../components/Typography/Typography'
import ProposalsByTicBarChart from '../components/widgets/ProposalsByTic'
import ProposalsByMonthBarChart from '../components/widgets/ProposalsByMonth'
import ProposalsCalendar from '../components/widgets/ProposalsCalendar'
import DayStats from '../components/widgets/DayStats'
import Counts from '../components/widgets/Counts'

// const useStyles = makeStyles(theme => ({
//     page: { },
//     card: {
//         marginBottom: theme.spacing(2),
//         backgroundColor: theme.palette.grey[100],
//     },
//     chartContainer: {
//         padding: theme.spacing(4),
//         width: 'calc(100vw - 48px)',
//         [theme.breakpoints.up('sm')]: {
//             width: 'calc(100vw - 240px - 86px)',
//         },
//     },
//     barChartContainer: {
//         height: '700px',
//         position: 'relative',
//     },
//     calendarContainer: {
//         height: `calc(100vw * 30/55 + 64px)`,
//         [theme.breakpoints.up('sm')]: {
//             height: `calc((100vw - 240px) * 26/55 + 64px)`,
//         }
//     },
//     pieChartContainer: {
//         height: '700px',
//     },
//     groupingButtonsContainer: {
//         textAlign: 'right',
//         position: 'absolute',
//         bottom: theme.spacing(3),
//         right: theme.spacing(1),
//     },
//     groupingButton: {
//         margin: `0 ${ theme.spacing(1) }px`
//     },
// }))

const HomePage = (props) => {
    const theme = useTheme()
    // const classes = useStyles()

    return (
        <div>
            <div>
                <Heading>Dashboard Home</Heading>
            </div>

            <Grid container spacing={ 2 }>
                <Grid item xs={ 12 } sm={ 11 }>
                    <Counts/>
                </Grid>
                <Grid item xs={ 12 } sm={ 11 }>
                    <ProposalsByTicBarChart />
                </Grid>
                <Grid item xs={ 12 } sm={ 11 } lg={ 5 }>
                    <ProposalsByMonthBarChart />
                </Grid>
                <Grid item xs={ 12 } sm={ 11 } lg={ 6 } >
                    <ProposalsCalendar />
                </Grid>
                <Grid item xs={ 12 } sm={ 11 }>
                    <DayStats />
                </Grid>
            </Grid>
        </div>
    )
}

export default HomePage