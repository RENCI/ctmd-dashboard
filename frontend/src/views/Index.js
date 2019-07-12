import React from 'react'
import { Grid } from '@material-ui/core'
import { Heading } from '../components/Typography/Typography'
import ProposalsByTicBarChart from '../components/widgets/ProposalsByTic'
import ProposalsByMonthBarChart from '../components/widgets/ProposalsByMonth'
import ProposalsCalendar from '../components/widgets/ProposalsCalendar'
import DayStats from '../components/widgets/DayStats'
import Counts from '../components/widgets/Counts'

export const HomePage = (props) => {

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
