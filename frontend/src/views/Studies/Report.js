import React, { Fragment, useContext, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import axios from 'axios'
import api from '../../Api'
import { NavLink } from 'react-router-dom'
import { StoreContext } from '../../contexts/StoreContext'
import { Grid, Card, CardHeader, CardContent, Typography, Input, Slider, Button } from '@material-ui/core'
import { Title, Paragraph } from '../../components/Typography'
import { CircularLoader } from '../../components/Progress/Progress'
import { SitesTable } from '../../components/Tables'
import StudyEnrollment from '../../components/Visualizations/StudyEnrollmentContainer'
import { Milestones } from './Milestones'
import { convertBoolToYesOrNo } from '../../utils/Format'
import { formatDate } from '../../utils/DateFormat'
import { useForm } from 'react-hook-form'
import { Edit } from '@material-ui/icons'
import { motion } from 'framer-motion'

const useStyles = makeStyles((theme) => ({
  pairStyle: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '9px',
  },
  action: {
    height: 'initial',
    marginTop: '0px',
    marginRight: '0px',
    cursor: 'pointer',
  },
  inputStyle: {
    color: '#000000',
    border: '1px solid #D3D3D3',
    borderRadius: '4px',
    padding: '7px',
    width: '70%',
    '&:focus': {
      border: '1px solid #339898',
      outline: 'none',
    },
  },
  inputFocusedStyle: {
    border: '1px solid red',
    color: 'red',
    fontSize: '300px;',
  },
  gridStyle: {
    fontSize: '150%',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    marginBottom: '3rem',
    gridRowGap: '22px',
  },
  keyStyle: {
    color: theme.palette.primary.main,
    marginRight: '0.5rem',
    fontWeight: 600,
  },
  valueStyle: {
    color: theme.palette.grey[600],
    flex: 1,
  },
  buttonGrid: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
}))

const Key = ({ children }) => {
  const { keyStyle } = useStyles()
  return <span className={keyStyle}>{children}</span>
}

const Value = ({ children }) => {
  const { valueStyle } = useStyles()
  return <span className={valueStyle}>{children}</span>
}

const dateFields = ['Date Funding was Awarded']

// Profile
const StudyProfile = ({ profile, editMode, register }) => {
  const { pairStyle, gridStyle, inputStyle, inputFocusedStyle } = useStyles()
  // const { register, handleSubmit, watch, errors } = useForm()

  const defaultState = {
    opacity: 0,
    scale: 0.6,
  }

  return (
    <article className={gridStyle}>
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
            {editMode ? (
              <motion.input
                className={inputStyle}
                name={displayName}
                ref={register}
                defaultValue={value}
                initial={defaultState}
                exit={defaultState}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
              />
            ) : (
              <Value>{value}</Value>
            )}
          </div>
        )
      })}
    </article>
  )
}

const uploadProfileData = async (data) => {
  console.log(api.uploadStudyProfile)
  const response = await axios({
    url: api.uploadStudyProfile,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: data,
  })
  console.log(response)
}

export const StudyReportPage = (props) => {
  const proposalId = props.match.params.proposalID
  const { register, handleSubmit, watch, errors } = useForm()
  const [store] = useContext(StoreContext)
  const [study, setStudy] = useState(null)
  const [studyProfile, setStudyProfile] = useState(null)
  const [studySites, setStudySites] = useState(null)
  const [studyEnrollmentData, setStudyEnrollmentData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [enrollmentRate, setEnrollmentRate] = useState(0.2)
  const [editMode, setEditMode] = useState(false)
  const classes = useStyles()
  const onSubmit = (data, e) => {
    uploadProfileData(data)
    console.log(data, e)
  }
  const onError = (errors, e) => console.log(errors, e)

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
          axios.get(api.studyProfile(proposalID)),
          axios.get(api.studySites(proposalID)),
          axios.get(api.studyEnrollmentData(proposalID)),
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
  const maxEnrollmentRate = 2

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

  // Marks for enrollment rate slider
  const markStep = 0.1
  const marks = Array(maxEnrollmentRate / markStep + 1)
    .fill()
    .map((d, i) => {
      const v = i * 0.1
      const s = v.toFixed(1)

      return {
        value: +v,
        label: s,
      }
    })

  return (
    <div>
      <Title>Study Report for {study && (study.shortTitle || '...')}</Title>

      {isLoading && <CircularLoader />}
      {!isLoading && (
        <Grid container spacing={8}>
          <Grid item xs={12} sm={6} md={7} lg={8}>
            <Card style={{ height: '100%' }}>
              <CardHeader
                title="Study Profile"
                classes={{ action: classes.action }}
                action={<Edit style={{ fill: 'rgb(91, 114, 135)' }} onClick={setEditMode} />}
              />

              <CardContent>
                {studyProfile ? (
                  <StudyProfile profile={studyProfile} editMode={editMode} register={register} />
                ) : (
                  <Paragraph>
                    No profile found! <NavLink to="/uploads">Upload it</NavLink>!
                  </Paragraph>
                )}
                <div className={classes.buttonGrid}>
                  <form onSubmit={handleSubmit(onSubmit, onError)}>
                    <Button type="submit" variant="contained" color="secondary">
                      Save
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={11} sm={5} md={4} lg={3}>
            <Milestones sites={studySites} />
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
                    <Typography align="right">Enrollment rate</Typography>
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
                      <Grid item mr={5}>
                        <Input
                          value={enrollmentRate}
                          margin="dense"
                          onChange={handleEnrollmentRateInputChange}
                          onBlur={handleEnrollmentRateInputBlur}
                          inputProps={{
                            step: 0.01,
                            min: 0,
                            max: 2,
                            type: 'number',
                          }}
                        />
                      </Grid>
                    </Grid>
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
