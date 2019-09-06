import React, { Fragment, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import api from '../../Api'
import { NavLink } from 'react-router-dom'
import { StoreContext } from '../../contexts/StoreContext'
import { Grid, Card, CardHeader, CardContent, Button } from '@material-ui/core'
import { List, ListItem, ListItemText } from '@material-ui/core'
import { Title, Subsubheading, Paragraph, Caption } from '../../components/Typography'
import { CircularLoader } from '../../components/Progress/Progress'
import { SitesTable } from '../../components/Tables'
import { isSiteActive } from '../../utils/sites'
import { SitesActivationPieChart } from '../../components/Charts'
import StudyEnrollment from '../../components/Visualizations/StudyEnrollmentContainer'
import { formatDate } from '../../utils'

export const StudyReportPage = props => {
    const proposalId = props.match.params.proposalID
    const [store, ] = useContext(StoreContext)
    const [study, setStudy] = useState(null)
    const [studyProfile, setStudyProfile] = useState(null)
    const [studySites, setStudySites] = useState(null)
    const [studyEnrollmentData, setStudyEnrollmentData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    
    useEffect(() => {
        if (store.proposals) {
            try {
                const studyFromRoute = store.proposals.find(proposal => proposal.proposalID == proposalId)
                setStudy(studyFromRoute)
            } catch (error) {
                console.log(`Could not load study #${ proposalId }`, error)
            }
        }
    }, [store.proposals])

    useEffect(() => {
        const fetchStudyData = async (proposalID) => {
            axios.all([
                axios.get(api.studyProfile(proposalID)),
                axios.get(api.studySites(proposalID)),
                axios.get(api.studyEnrollmentData(proposalID))
            ])
            .then(axios.spread((profileResponse, sitesResponse, enrollmentResponse) => {
                setStudyProfile(profileResponse.data)
                setStudySites(sitesResponse.data)
                setStudyEnrollmentData(enrollmentResponse.data)
            }))
        }
        fetchStudyData(proposalId)
    }, [])

    useEffect(() => {
        setIsLoading(!studyProfile || !studySites)
    }, [studyProfile, studySites])

    return (
        <div>
            <Title>Study Report for { study && (study.shortTitle || '...') }</Title>

            { isLoading && <CircularLoader /> }
            {
                !isLoading && (
                    <Grid container spacing={ 4 }>
                        <Grid item xs={ 12 }>
                            <Card>
                                <CardHeader title="Study Profile"/>
                                <CardContent>
                                    {
                                        studyProfile && studyProfile.length > 0
                                            ? <pre>{ JSON.stringify(studyProfile, null, 2) }</pre>
                                            : <Paragraph>No profile found! <NavLink to={ `${ proposalId }/uploads` }>Upload it</NavLink>!</Paragraph>
                                    }
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        {
                            studySites && studySites.length > 0 ? (
                                <Fragment>
                                    <Grid item xs={ 12 }>
                                        <SitesTable sites={ studySites } title="Sites" paging={ true } />
                                    </Grid>
                                </Fragment>
                            ) : (
                                <Grid item xs={ 12 }>
                                    <Card>
                                        <CardHeader title="Sites" />
                                        <CardContent>
                                            <Paragraph>No sites list found! <NavLink to={ `${ proposalId }/uploads` }>Upload it</NavLink>!</Paragraph>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )
                        }
                        
                        <Grid item xs={ 12 }>
                            <Card>
                                <CardHeader title="Enrollment Information" />
                                <CardContent>
                                    {
                                        studyEnrollmentData && studyEnrollmentData.length > 0
                                            ? <StudyEnrollment enrollmentData={ studyEnrollmentData }/>
                                            : <Paragraph>No enrollment information found! <NavLink to={ `${ proposalId }/uploads` }>Upload it</NavLink>!</Paragraph>
                                    }
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )
            }
        </div>
    )
}
