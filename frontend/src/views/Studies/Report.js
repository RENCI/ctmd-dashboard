import React, { Fragment, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import api from '../../Api'
import { NavLink } from 'react-router-dom'
import { StoreContext } from '../../contexts/StoreContext'
import { Grid, Card, CardHeader, CardContent, Typography, Input } from '@material-ui/core'
import { Slider } from '@material-ui/lab'
import { Title, Paragraph } from '../../components/Typography'
import { CircularLoader } from '../../components/Progress/Progress'
import { SitesTable } from '../../components/Tables'
import StudyEnrollment from '../../components/Visualizations/StudyEnrollmentContainer'

const StudyProfile = ({ profile }) => {
    return (
        <article>
            {
                Object.keys(profile).map(key => (
                    <Fragment>
                        <strong>{ key }</strong>: { profile[key] }<br />
                    </Fragment>
                ))
            }
        </article>
    )
}

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
            await axios.all([
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
        console.log(studySites)
        setIsLoading(!study || !studyProfile || !studySites || !studyEnrollmentData)
    }, [study, studyProfile, studySites, studyEnrollmentData])

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
                                            ? <StudyProfile profile={ studyProfile[0] } />
                                            : <Paragraph>No profile found! <NavLink to="/uploads">Upload it</NavLink>!</Paragraph>
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
                                            <Paragraph>No sites list found! <NavLink to="/uploads">Upload it</NavLink>!</Paragraph>
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
                                                <Fragment>
                                                    
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
                                                                max={ 2 }
                                                                step={ 0.01 }
                                                                marks={ marks }
                                                                onChange={ handleEnrollmentRateSliderChange }
                                                            />
                                                        </Grid>
                                                        <Grid item mr={5}>
                                                            <Input
                                                                value={ enrollmentRate }
                                                                margin="dense"
                                                                onChange={ handleEnrollmentRateInputChange }
                                                                onBlur={ handleEnrollmentRateInputBlur }
                                                                inputProps={{
                                                                    step: 0.01,
                                                                    min: 0,
                                                                    max: 2,
                                                                    type: "number"
                                                                }}
                                                              />
                                                        </Grid>
                                                    </Grid>
                                                </Fragment>
                                            ) : <Paragraph>No enrollment information found! <NavLink to="/uploads">Upload it</NavLink>!</Paragraph>
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
