import React, { Fragment, useState } from 'react'
import { Title } from '../components/Typography'
import { Grid, IconButton } from '@material-ui/core'
import { DangerZone, TaskManager } from '../components/Forms'
import { CollapsibleCard } from '../components/CollapsibleCard'
import { Refresh as RefreshIcon } from '@material-ui/icons'

export const ManagementPage = props => {
    const [taskMonitorKey, setTaskMonitorKey] = useState(0)

    const handleRefreshTaskManager = () => setTaskMonitorKey(taskMonitorKey === 0 ? 1 : 0)

    return (
        <Fragment>
            <Title>Data Manager</Title>
            
            <Grid container spacing={ 8 }>

                <Grid item xs={ 12 }>
                    <CollapsibleCard
                        title="Task Monitor"
                        subheader="View tasks and their statuses"
                        actions={
                            <IconButton color="secondary" aria-label="Refresh Tasks" onClick={ handleRefreshTaskManager }><RefreshIcon /></IconButton>
                        }
                    >
                        <TaskManager key={ taskMonitorKey }/>
                    </CollapsibleCard>
                </Grid>
                
                <Grid item xs={ 12 }>
                    <CollapsibleCard
                        title="Danger Zone"
                        subheader="Backup, restore, and synchronize data"
                    >
                        <DangerZone />
                    </CollapsibleCard>
                </Grid>

            </Grid>

        </Fragment>
    )
}
