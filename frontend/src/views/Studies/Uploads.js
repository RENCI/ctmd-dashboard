import React, { useContext, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import axios from 'axios'
import api from '../../Api'
import { useTheme } from '@material-ui/styles'
import { StoreContext } from '../../contexts/StoreContext'
import { Grid, Card, CardHeader, CardContent, Button, IconButton } from '@material-ui/core'
import { List, ListItem, ListItemText } from '@material-ui/core'
import { Title, Subsubheading, Caption } from '../../components/Typography'
import { CircularLoader } from '../../components/Progress/Progress'
import { SitesTable } from '../../components/Tables'
import { isSiteActive } from '../../utils/sites'
import { SitesActivationPieChart } from '../../components/Charts'
import StudyEnrollment from '../../components/Visualizations/StudyEnrollmentContainer'
import { CollapsibleCard } from '../../components/CollapsibleCard'
import { SitesReport } from './SitesReport'
import { formatDate } from '../../utils'
import { FileDrop } from '../../components/Forms'
import { DropZone } from '../../components/Forms'
import { CloudUpload as UploadIcon } from '@material-ui/icons'

export const StudyUploadsPage = props => {
    const proposalId = props.match.params.proposalID
    const [store, ] = useContext(StoreContext)
    const [study, setStudy] = useState(null)
    const [studySites, setStudySites] = useState(null)
    const [studyProfile, setStudyProfile] = useState(null)
    const [allSites, setAllSites] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const theme = useTheme()
    
    useEffect(() => {
        if (store.proposals) {
            try {
                const studyFromRoute = store.proposals.find(proposal => proposal.proposalID == proposalId)
                setStudy(studyFromRoute)
            } catch (error) {
                console.log(`Could not locate study #${ proposalId }`, error)
            }
        }
    }, [store.proposals])


    return (
        <div>
            <Grid container>
                <Grid item xs={ 12 } md={ 6 } component={ Title }>Uploads for { study && (study.shortTitle || '...') } ( { proposalId } )</Grid>
                <Grid item xs={ 12 } md={ 6 }>
                    <Button color="secondary" variant="contained"  size="large" style={{ float: 'right' }} component={ NavLink } to={ `/studies/${ proposalId }` }>
                        Back to Report
                    </Button>
                </Grid>
            </Grid>

            <Grid container spacing={ 4 }>
                <Grid item xs={ 12 }>
                    <Card>
                        <CardHeader title="Upload Profile" />
                        <CardContent>
                            <DropZone endpoint={ api.uploadStudyProfile } />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={ 12 }>
                    <Card>
                        <CardHeader title="Upload Sites" />
                        <CardContent>
                            <DropZone endpoint={ api.uploadStudySites } />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={ 12 }>
                    <Card>
                        <CardHeader title="Upload Enrollment Data" />
                        <CardContent>
                            <DropZone endpoint={ api.uploadStudyEnrollmentData } />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    )
}
