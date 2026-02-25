import React from 'react'
import { Grid } from '@material-ui/core'
import { Title } from '../components/Typography'
import {
    ProposalsByTicBarChart, ProposalsByMonthChart, ProposalsCalendar, DayStats, Counts, ResourceMetrics
} from '../components/Widgets'

export const HomePage = (props) => {
    return (
        <div>
            <Title>
                Clinical Trial Management Dashboard
                { process.env.REACT_APP_IS_HEAL_SERVER === 'true' && <span> — HEAL</span> }
            </Title>

            <Grid container spacing={ 8 } alignItems="stretch">
                <Grid item xs={ 12 } sm={ 11 }>
                    <Counts/>
                </Grid>
                <Grid item xs={ 12 } sm={ 11 }>
                    <ProposalsByTicBarChart />
                </Grid>
                <Grid item xs={ 12 } sm={ 11 } lg={ 5 }>
                    <ProposalsByMonthChart />
                </Grid>
                <Grid item xs={ 12 } sm={ 11 } lg={ 6 } >
                    <ProposalsCalendar />
                </Grid>
                <Grid item xs={ 12 } sm={ 11 }>
                    <DayStats />
                </Grid>
                <Grid item xs={ 12 } sm={ 11 }>
                    <ResourceMetrics />
                </Grid>
            </Grid>
        </div>
    )
}
