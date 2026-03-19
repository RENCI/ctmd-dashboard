import React, { useContext } from 'react'
import { Grid } from '@material-ui/core'
import { Title } from '../components/Typography'
import {
    ProposalsByTicBarChart, ProposalsByMonthChart, ProposalsCalendar, DayStats, Counts, ResourceMetrics
} from '../components/Widgets'
import { AuthContext } from '../contexts'

export const HomePage = (props) => {
    const { isHealServer } = useContext(AuthContext)
    
    return (
        <div>
            <Title>
                Clinical Trial Management Dashboard
                { isHealServer && <span> — HEAL</span> }
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
