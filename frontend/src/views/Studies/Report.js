import React, { Fragment, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import api from '../../Api'
import { NavLink } from 'react-router-dom'
import { StoreContext } from '../../contexts/StoreContext'
<<<<<<< HEAD
import { Grid, Card, CardHeader, CardContent } from '@material-ui/core'
import { Title, Paragraph } from '../../components/Typography'
=======
import {
    Grid, Card, CardHeader, CardContent, Button, IconButton, Typography, Input,
    List, ListItem, ListItemIcon, ListItemText,
} from '@material-ui/core'
import { Slider } from '@material-ui/lab'
import { Title, Subsubheading, Paragraph, Caption } from '../../components/Typography'
>>>>>>> attempt merge
import { CircularLoader } from '../../components/Progress/Progress'
import { SitesTable } from '../../components/Tables'
import StudyEnrollment from '../../components/Visualizations/StudyEnrollmentContainer'

export const StudyReportPage = props => {
    const proposalId = props.match.params.proposalID
    const [store, ] = useContext(StoreContext)
    const [study, setStudy] = useState(null)
    const [studyProfile, setStudyProfile] = useState(null)
    const [studySites, setStudySites] = useState(null)
    const [studyEnrollmentData, setStudyEnrollmentData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [enrollmentRate, setEnrollmentRate] = useState(0.2)

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

        const handleEnrollmentRateSliderChange = (event, value) => {
        setEnrollmentRate(value);
    };

    const handleEnrollmentRateInputChange = event => {
      setEnrollmentRate(event.target.value === '' ? '' : Number(event.target.value));
    };

    const handleEnrollmentRateInputBlur = () => {
      if (enrollmentRate < 0) {
        setEnrollmentRate(0);
      }
      else if (enrollmentRate > 1) {
        setEnrollmentRate(1);
      }
    };

    // Marks for enrollment rate slider
    const marks = Array(11).fill().map((d, i) => {
      const v = i * 0.1;
      const s = v.toFixed(1);

      return {
        value: +v,
        label: s
      };
    });


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
                                            ? (
                                                <div>
                                                    
                                                    <StudyEnrollment
                                                        study={ study || null }
                                                        sites={ studySites || null}
                                                        enrollmentRate={ enrollmentRate }
                                                    />
                                                    <Typography align="right">
                                                        Enrollment rate
                                                    </Typography>
                                                    <Grid container spacing={6} justify="flex-end">
                                                        <Grid item xs={5}>
                                                            <Slider
                                                                value={ enrollmentRate }
                                                                min={ 0 }
                                                                max={ 1 }
                                                                step={ 0.01 }
                                                                marks={marks}
                                                                onChange={ handleEnrollmentRateSliderChange }
                                                            />
                                                        </Grid>
                                                        <Grid item mr={5}>
                                                            <Input
                                                                value={ enrollmentRate }
                                                                margin="dense"
                                                                onChange={handleEnrollmentRateInputChange}
                                                                onBlur={handleEnrollmentRateInputBlur}
                                                                inputProps={{
                                                                    step: 0.01,
                                                                    min: 0,
                                                                    max: 1,
                                                                    type: "number"
                                                                }}
                                                              />
                                                        </Grid>
                                                    </Grid>
                                                </div>
                                            ) : <Paragraph>No enrollment information found! <NavLink to={ `${ proposalId }/uploads` }>Upload it</NavLink>!</Paragraph>
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
