import React, { useEffect, useContext, useState } from 'react'
import axios from 'axios'
import { makeStyles, useTheme } from '@material-ui/styles'
import { StoreContext } from '../contexts/StoreContext'
import { Grid, List, ListItem, Avatar, ListItemText, Card, CardHeader, CardContent } from '@material-ui/core'
import { FormControl, FormLabel, Select, MenuItem, OutlinedInput } from '@material-ui/core'
import {
    AccountBalance as InstitutionIcon,
    Assignment as TicIcon,
} from '@material-ui/icons'
import { Heading } from '../components/Typography/Typography'
import MetricsTable from '../components/Charts/MetricsTable'
import { endpoints as api } from '../contexts/ApiContext'

const useStyles = makeStyles(theme => ({
    card: { },
    cardActions: {
        flex: '3 0 auto',
    },
}))

const StudyMetricsPage = props => {
    const [store, ] = useContext(StoreContext)
    const [studies, setStudies] = useState([])
    const [currentStudy, setCurrentStudy] = useState(null)
    const [currentMetrics, setCurrentMetrics] = useState(null)
    const classes = useStyles()
    const theme = useTheme()

    useEffect(() => {
        setStudies(['SPIRRIT', 'STRESS'])
    }, [])
    
    useEffect(() => {
        if (currentStudy) {
            axios.get(api.tempStudyMetrics(currentStudy))
                .then(response => {
                    setCurrentMetrics(response.data)
                })
                .catch(error => console.error(error))
        }
    }, [currentStudy])

    const handleChangeCurrentStudy = event => {
        setCurrentStudy(event.target.value === '-1' ? null : event.target.value)
    }

    return (
        <div>

            <Heading>Study Metrics</Heading>
            
            <Grid container spacing={ theme.spacing(2) }>
                <Grid item xs={ 12 }>
                    <Card classes={{ root: classes.card }}>
                        <CardHeader title="Proposal Details" classes={{ action: classes.cardActions }} action={
                            <FormControl fullWidth variant="outlined">
                                <FormLabel>Select Proposal</FormLabel>
                                <Select
                                    value={ currentStudy ? currentStudy : -1 }
                                    onChange={ handleChangeCurrentStudy }
                                    input={ <OutlinedInput fullWidth labelWidth={ 0 } name="network" id="network" style={{ marginTop: '16px' }}/> }
                                >
                                    <MenuItem value="-1">-</MenuItem>
                                    { studies && studies.map(proposal => <MenuItem key={ proposal } value={ proposal }>{ proposal }</MenuItem>) }
                                </Select>
                            </FormControl>
                        }/>
                        <CardContent>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={ 12 }>
                    {
                        currentStudy && currentMetrics
                        ? <div>Metrics Table</div>
                        // <MetricsTable studyData={ currentMetrics } paging={ true } />
                        : null
                    }
                </Grid>
            </Grid>
            
        </div>
    )
}

export default StudyMetricsPage