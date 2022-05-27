import React, { Fragment, useContext, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import axios from 'axios'
import { scaleLinear } from 'd3-scale'
import api from '../../Api'
import { NavLink } from 'react-router-dom'
import { StoreContext } from '../../contexts/StoreContext'
import { Grid, Card, CardHeader, CardContent, Input, InputLabel, Slider, Box } from '@material-ui/core'
import { Title, Paragraph } from '../../components/Typography'
import { CircularLoader } from '../../components/Progress/Progress'
import { SitesTable } from '../../components/Tables'
import StudyEnrollment from '../../components/Visualizations/StudyEnrollmentContainer'
import { Milestones } from './Milestones'
import { CombinedMetrics } from './CombinedMetrics'
import { convertBoolToYesOrNo, formatDate } from '../../utils'
import { AuthContext } from '../../contexts'

const useStyles = makeStyles((theme) => ({
  pairStyle: {
    fontSize: '125%',
    display: 'flex',
    marginBottom: '0.5rem',
  },
  keyStyle: {
    color: theme.palette.grey[600],
    marginRight: '0.5rem',
  },
  valueStyle: {
    color: theme.palette.primary.main,
    flex: 1,
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
  },
}))

const Key = ({ children }) => {
  const { keyStyle } = useStyles()
  return <span className={keyStyle}>{children}:</span>
}

const Value = ({ children }) => {
  const { valueStyle } = useStyles()
  return <span className={valueStyle}>{children}</span>
}

const dateFields = ['Date Funding was Awarded']

// Profile
const StudyProfile = ({ profile }) => {
  const { pairStyle } = useStyles()

  return (
    <article>
      {Object.keys(profile).map((key, i) => {
        const displayName = profile[key].displayName
        let value = profile[key].value

        if (typeof profile[key].value === 'boolean') {
          value = convertBoolToYesOrNo(profile[key].value)
        } else if (dateFields.includes(key)) {
          value = formatDate(new Date(value))
        }

        return (
          <div className={pairStyle} key={i}>
            <Key>{displayName}</Key>
            <Value>{value}</Value>
          </div>
        )
      })}
    </article>
  )
}

export const StudyReportPage = (props) => {
  const proposalId = props.match.params.proposalID
  const [store] = useContext(StoreContext)
  const [study, setStudy] = useState(null)
  const [studyProfile, setStudyProfile] = useState(null)
  const [studySites, setStudySites] = useState(null)
  const [studyEnrollmentData, setStudyEnrollmentData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [enrollmentRate, setEnrollmentRate] = useState(0.2)
  const [maxEnrollmentRate, setMaxEnrollmentRate] = useState(2)
  const [initialParticipatingSiteCount, setInitialParticipatingSiteCount] = useState(null)
  const { isPLAdmin } = useContext(AuthContext)

  useEffect(() => {
    if (store.proposals) {
      try {
        const studyFromRoute = store.proposals.find((proposal) => proposal.proposalID == proposalId)
        setStudy(studyFromRoute)
      } catch (error) {
        console.log(`Could not load study #${proposalId}`, error)
      }
    }
  }, [store.proposals])

  useEffect(() => {
    const fetchStudyData = async (proposalID) => {
      await axios
        .all([
          axios.get(api.studyProfile(proposalID), { withCredentials: true }),
          axios.get(api.studySites(proposalID), { withCredentials: true }),
          axios.get(api.studyEnrollmentData(proposalID), { withCredentials: true }),
        ])
        .then(
          axios.spread((profileResponse, sitesResponse, enrollmentResponse) => {
            setStudyProfile(profileResponse.data)

            sitesResponse.data.forEach((site) => {
              // Convert enrollment data to numbers
              site.patientsConsentedCount = +site.patientsConsentedCount
              site.patientsEnrolledCount = +site.patientsEnrolledCount
              site.patientsWithdrawnCount = +site.patientsWithdrawnCount
              site.patientsExpectedCount = +site.patientsExpectedCount
              site.queriesCount = +site.queriesCount
              site.protocolDeviationsCount = +site.protocolDeviationsCount
            })

            setStudySites(sitesResponse.data)
            setStudyEnrollmentData(enrollmentResponse.data)
            setInitialParticipatingSiteCount(profileResponse.data.initialParticipatingSiteCount.value)
          })
        )
        .catch((err) => {
          console.log('FAIL', err)
        })
    }
    fetchStudyData(proposalId)
  }, [])

  useEffect(() => {
    setIsLoading(!study || !studyProfile || !studySites || !studyEnrollmentData)
  }, [study, studyProfile, studySites, studyEnrollmentData])

  // Slider
  const handleEnrollmentRateSliderChange = (event, value) => {
    setEnrollmentRate(value)
  }

  const handleEnrollmentRateInputChange = (event) => {
    setEnrollmentRate(event.target.value === '' ? '' : Number(event.target.value))
  }

  const handleEnrollmentRateInputBlur = () => {
    if (enrollmentRate < 0) {
      setEnrollmentRate(0)
    } else if (enrollmentRate > maxEnrollmentRate) {
      setEnrollmentRate(maxEnrollmentRate)
    }
  }

  const handleMaxEnrollmentRateInputChange = (event) => {
    const value = event.target.value === '' ? '' : Number(event.target.value)

    setMaxEnrollmentRate(value)

    if (value && enrollmentRate > value) setEnrollmentRate(value)
  }

  const handleMaxEnrollmentRateInputBlur = () => {
    if (maxEnrollmentRate < 0) {
      setMaxEnrollmentRate(1)
    }
  }

  // Marks for enrollment rate slider
  const sliderScale = scaleLinear()
      .domain([0, maxEnrollmentRate]);

  const marks = sliderScale.ticks(20).map(d => ({ value: d, label: d }));

  return (
    <div>
      <Title>Study Report for {study && (study.shortTitle || '...')}</Title>

      {isLoading && <CircularLoader />}
      {!isLoading && (
        <Grid container spacing={8}>
          <Grid item xs={12} md={6} lg={6}>
            <Card style={{ height: '100%' }}>
              <CardHeader title="Study Profile" />
              <CardContent>
                {studyProfile ? (
                  <StudyProfile profile={studyProfile} />
                ) : (
                  <Paragraph>No profile found! {isPLAdmin && <NavLink to="/uploads">Upload it</NavLink>}!</Paragraph>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={11} md={5} lg={5}>
            <Milestones
              sites={studySites}
              sitesCount={initialParticipatingSiteCount}
              enrollmentGoal={+studyProfile.enrollmentGoal.value}
              enrollmentData={studyEnrollmentData}
            />
          </Grid>

          <Grid item xs={11}>
            <Card>
              <CardHeader title="Combined Metrics" subheader="Averaged across all study sites" />
              <CardContent>
                {studyProfile ? (
                  <CombinedMetrics study={ study } studyProfile={ studyProfile } sites={ studySites } />
                ) : (
                  <Paragraph>No profile found! {isPLAdmin && <NavLink to="/uploads">Upload it</NavLink>}!</Paragraph>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={11}>
            {studySites && studySites.length > 0 ? (
              // <p></p>
              <SitesTable sites={studySites} title="Sites" paging={true} />
            ) : (
              <Card>
                <CardHeader title="Sites" />
                <CardContent>
                  <Paragraph>
                    No sites list found! <NavLink to="/uploads">Upload it</NavLink>!
                  </Paragraph>
                </CardContent>
              </Card>
            )}
          </Grid>

          <Grid item xs={11}>
            <Card>
              <CardHeader title="Enrollment Information" />
              <CardContent>
                {studyEnrollmentData && studyEnrollmentData.length > 0 ? (
                  <Fragment>
                    <StudyEnrollment study={study || null} sites={studySites || null} enrollmentRate={enrollmentRate} />
                    <Box mt={3}>
                      <Grid container spacing={6} justify="flex-end">
                        <Grid item xs={5}>
                          <Slider
                            value={enrollmentRate}
                            min={0}
                            max={maxEnrollmentRate}
                            step={0.01}
                            marks={marks}
                            onChange={handleEnrollmentRateSliderChange}
                          />
                        </Grid>
                        <Grid item>
                          <InputLabel htmlFor="enrollment-rate-input">enrollment rate</InputLabel>
                          <Input
                            id="enrollment-rate-input"
                            value={enrollmentRate}
                            margin="dense"
                            onChange={handleEnrollmentRateInputChange}
                            onBlur={handleEnrollmentRateInputBlur}
                            inputProps={{
                              min: 0,
                              max: maxEnrollmentRate,
                              step: 0.01,
                              type: 'number',
                            }}
                          />
                        </Grid>
                        <Grid item>
                          <InputLabel htmlFor="max-enrollment-rate-input">maximum</InputLabel>
                          <Input
                            id="max-enrollment-rate-input"
                            value={maxEnrollmentRate}
                            label="max"
                            margin="dense"
                            onChange={handleMaxEnrollmentRateInputChange}
                            onBlur={handleMaxEnrollmentRateInputBlur}
                            inputProps={{
                              step: 1,
                              min: 1,
                              max: Number.MAX_VALUE,
                              type: 'number',
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Fragment>
                ) : (
                  <Paragraph>
                    No enrollment information found! <NavLink to="/uploads">Upload it</NavLink>!
                  </Paragraph>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </div>
  )
}
