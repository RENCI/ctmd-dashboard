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
import { Heading, Subheading, Paragraph } from '../components/Typography/Typography'
import SiteReport from '../components/Charts/SiteReport'
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
    const [currentStudy, setCurrentStudy] = useState(-1)
    const [currentSites, setCurrentSites] = useState(null)
    const [currentSite, setCurrentSite] = useState(-1)
    const classes = useStyles()
    const theme = useTheme()

    useEffect(() => {
        setStudies(['SPIRRIT', 'STRESS'])
    }, [])
    
    useEffect(() => {
        if (currentStudy) {
            axios.get(api.tempStudyMetrics(currentStudy))
                .then(response => setCurrentSites(response.data))
                .catch(error => console.error(error))
        }
    }, [currentStudy])

    const handleChangeCurrentStudy = event => setCurrentStudy(event.target.value === '-1' ? null : event.target.value)
    const handleChangeCurrentSite = event => setCurrentSite(currentSites.find(site => site['Site #'] === event.target.value))

    return (
        <div>

            <Heading>Study Metrics</Heading>
            
            <Grid container>
                <Grid item xs={ 12 }>
                    <Card xs={ 12 }>
                        <CardHeader
                            title="Site Reports"
                            subheader="According to the ten metrics defined by the Tufts/JHU Metrics Project"
                        />
                        <CardContent>
                            <Select
                                value={ currentStudy }
                                onChange={ handleChangeCurrentStudy }
                                input={ <OutlinedInput fullWidth labelWidth={ 0 } name="study" id="study" style={{ marginTop: '16px' }}/> }
                            >
                                <MenuItem value="-1">Select Protocol</MenuItem>
                                { studies.map(study => <MenuItem key={ study } value={ study } onClick={ handleChangeCurrentStudy }>{ study }</MenuItem>) }
                            </Select>
                             <Select
                                value={ currentSite == -1 ? '-1' : currentSite['Site #'] }
                                onChange={ handleChangeCurrentSite }
                                input={ <OutlinedInput fullWidth labelWidth={ 0 } name="currentSite" id="currentSite" style={{ marginTop: '16px' }}/> }
                            >
                                <MenuItem value="-1">Select Site</MenuItem>
                                { currentSites && currentSites.map(site => <MenuItem key={ site['Site #'] } value={ site['Site #'] } onClick={ handleChangeCurrentSite }>{ site['Facility Name'] }</MenuItem>) }
                            </Select>
                        </CardContent>
                        <CardContent>
                            { currentSite !== -1 && <SiteReport currentSite={ currentSite } paging={ true } /> }
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    )
}

export default StudyMetricsPage