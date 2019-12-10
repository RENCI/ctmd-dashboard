import React, { Fragment, useContext, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
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
import { Milestones } from './Milestones'

const useStyles = makeStyles(theme => ({
    pairStyle: {
        fontSize: '125%',
        display: 'flex',
        marginBottom: '0.5rem'
    },
    keyStyle: {
        color: theme.palette.grey[600],
        marginRight: '0.5rem',
    },
    valueStyle: {
        color: theme.palette.primary.main,
        flex: 1,
        borderBottom: `1px solid ${ theme.palette.grey[200] }`,
    },
}))

const Key = ({ children }) => {
    const { keyStyle } = useStyles()
    return (
        <span className={ keyStyle }>{ children }:</span>
    )
}

const Value = ({ children }) => {
    const { valueStyle } = useStyles()
    return (
        <span className={ valueStyle }>{ children }</span>
    )
}

// Profile

const StudyProfile = ({ profile }) => {
    const { pairStyle } = useStyles()
    console.log(profile)
    return (
        <article>
            {
                Object.keys(profile).map(key => (
                    <div className={ pairStyle }>
                        <Key>{ profile[key].displayName }</Key>
                        <Value>{ profile[key].value }</Value>
                    </div>
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
                sitesResponse.data.forEach(site => {
                  // Convert enrollment data to numbers
                  site.patientsConsentedCount = +site.patientsConsentedCount;
                  site.patientsEnrolledCount = +site.patientsEnrolledCount;
                  site.patientsWithdrawnCount = +site.patientsWithdrawnCount;
                  site.patientsExpectedCount = +site.patientsExpectedCount;
                  site.queriesCount = +site.queriesCount;
                  site.protocolDeviationsCount = +site.protocolDeviationsCount;
                })
                setStudySites(sitesResponse.data)
                setStudyEnrollmentData(enrollmentResponse.data)
            }))
        }
        fetchStudyData(proposalId)
    }, [])

    useEffect(() => {
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
                    <Grid container spacing={ 8 }>
                        <Grid item xs={ 12 } sm={ 6 } md={ 7 } lg={ 8 }>
                            <Card style={{ height: '100%' }}>
                                <CardHeader title="Study Profile"/>
                                <CardContent>
                                    {
                                        studyProfile
                                            ? <StudyProfile profile={ studyProfile } />
                                            : <Paragraph>No profile found! <NavLink to="/uploads">Upload it</NavLink>!</Paragraph>
                                    }
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={ 11 } sm={ 5 } md={ 4 } lg={ 3 }>
                            <Milestones sites={ studySites } />
                        </Grid>

                        <Grid item xs={ 11 }>
                            {
                                studySites && studySites.length > 0 ? (
                                    <SitesTable sites={ studySites } title="Sites" paging={ true } />
                                ) : (
                                    <Card>
                                        <CardHeader title="Sites" />
                                        <CardContent>
                                            <Paragraph>No sites list found! <NavLink to="/uploads">Upload it</NavLink>!</Paragraph>
                                        </CardContent>
                                    </Card>
                                )
                            }
                        </Grid>

                        <Grid item xs={ 11 }>
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
