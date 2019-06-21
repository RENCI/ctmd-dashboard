import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { makeStyles } from '@material-ui/styles'
import { Grid, Button, Divider } from '@material-ui/core'
import { Paragraph } from '../Typography/Typography'
import { ApiContext } from '../../contexts/ApiContext'

const useStyles = makeStyles(theme => ({
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create(
            'transform', { duration: theme.transitions.duration.shortest }
        ),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    danger: {
        color: '#f66',
        border: '1px solid #f66',
        '&:hover': {
            backgroundColor: '#fee',
        }
    }
}))

const DangerZone = props => {
    const api = useContext(ApiContext)
    const classes = useStyles()
    const [backups, setBackups] = useState(['06/04/2019 04:07:30', '05/01/2019 12:52:27', '04/08/2019 13:41:06', '03/13/2019 19:56:58', '01/05/2019 19:08:05'])

    const fetchBackups = async () => {
        await axios.get(api.dataGetBackups)
            .then(response => {
                console.log(response.data)
            })
            .catch(error => console.error(error))
    }

    useEffect(() => {
        fetchBackups()
    }, [])
    
    const handleBackup = event => {
        console.log('Initializing data backup...')
        axios.get(api.dataPostBackup)
            .then(response => {
                console.log(response.data)
            })
            .catch(error => console.error(error))
        return
    }

    const handleRestore = timestamp => event => {
        console.log(`Restore data from ${ timestamp }...`)
        axios.get(api.dataRestore)
            .then(response => {
                console.log(response.data)
            })
            .catch(error => console.error(error))
        return
    }

    const handleSync = event => {
        console.log('Initializing data synchronization...')
        axios.post(api.dataSync)
            .then(response => {
                console.log(response.data)
            })
            .catch(error => console.error(error))
        return
    }

    return (
        <Grid container spacing={ 40 } alignItems="center">
            <Grid item xs={ 9 }>
                <strong>Backup</strong>
                <Paragraph>
                    Store a current snapshot of the database within this instance of the application to the server.
                    Executing a manual backup here may be a desirable action before stopping the application
                    to preserve data added or changed since the last automatic backup, which occur nightly.
                </Paragraph>
            </Grid>
            <Grid item xs={ 3 } style={{ textAlign: 'right' }}>
                <Button
                    size="large" fullWidth variant="outlined"
                    classes={{ outlined: classes.danger }}
                    onClick={ handleBackup }
                >
                    Backup
                </Button>
            </Grid>
            <Grid item xs={ 12 }><Divider /></Grid>
            <Grid item xs={ 12 }>
                <strong>Restore</strong>
                <Paragraph>
                    Restore the state of the database to a previous backup.
                </Paragraph>
            </Grid>
            <Grid item xs={ 12 }>
                {
                    backups.map((timestamp, i) => (
                        <Grid container key={ timestamp }>
                            <Grid item xs={ 12 } sm={ 9 }>
                                <Paragraph>{ i + 1 }. { timestamp }</Paragraph>
                            </Grid>
                            <Grid item xs={ 12 } sm={ 3 }>
                                <Button
                                    size="large" fullWidth variant="outlined"
                                    classes={{ outlined: classes.danger }}
                                    onClick={ handleRestore(timestamp) }
                                >
                                    Restore
                                </Button>
                            </Grid>
                        </Grid>
                        )
                    )
                }
            </Grid>
            <Grid item xs={ 12 }><Divider /></Grid>
            <Grid item xs={ 9 }>
                <strong>Synchronize</strong>
                <Paragraph>
                    Synchronize data with REDCap.
                </Paragraph>
            </Grid>
            <Grid item xs={ 3 } style={{ textAlign: 'right' }}>
                <Button
                    size="large" fullWidth variant="outlined"
                    classes={{ outlined: classes.danger }}
                    onClick={ handleSync }
                >
                    Sync
                </Button>
            </Grid>
        </Grid>
    )
}

export default DangerZone