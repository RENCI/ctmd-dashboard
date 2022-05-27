import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { Box, Card, CardHeader, CardContent, Grid, List, ListItem, ListItemText } from '@material-ui/core'
import { Subsubheading, Caption, Paragraph } from '../../components/Typography'
import { EnrollmentPieChart, SitesActivationPieChart } from '../../components/Charts'
import { formatDate } from '../../utils'
import { isSiteActive } from '../../utils/sites'

Array.prototype.chunk = function (size) {
  var chunks = []
  if (size > 0) {
    for (var i = 0; i < this.length; i += size) {
      chunks.push(this.slice(i, i + size))
    }
  }
  return chunks
}

export const Milestones = ({ sites, sitesCount, enrollmentGoal, enrollmentData }) => {
  const [patientCounts, setPatientCounts] = useState({ consented: 0, enrolled: 0, withdrawn: 0, expected: 0 })
  const [firstIRBApprovedDate, setFirstIRBApprovedDate] = useState()
  const [firstSiteActivationDate, setFirstSiteActivationDate] = useState()
  const [firstSubjectEnrolled, setFirstSubjectEnrolled] = useState()
  const [siteActivationPercentages, setSiteActivationPercentages] = useState([null, null, null, null])
  const [patientEnrollmentPercentages, setPatientEnrollmentPercentages] = useState([null, null, null, null])

  const earliestDate = property => {
    const reducer = (earliestDate, date) => (date < new Date(earliestDate) ? date : earliestDate)
    const sitesWithDates = sites.filter(site => !!site[property])
    let earliestDate = 'N/A'
    if (sitesWithDates.length) {
      earliestDate = sitesWithDates
        .map(site => new Date(site[property]))
        .reduce(reducer, new Date())
      return formatDate(earliestDate)
    }
    return earliestDate
  }

  const setSiteActivationThresholds = () => {
    let count = 0
    let thresholdDates = []

    const dates = sites
      .map(site => site.dateSiteActivated)
      .filter(date => !!date)
      .sort((d1, d2) => d1 < d2 ? -1 : 1)    
    let percentage = 0.25
    dates.forEach(date => {
      count += 1
      if (count / sitesCount >= 0.25 + 0.25 * thresholdDates.length) {
        thresholdDates.push(date)
      }
    })
    for (let i = 0; i < 4; i += 1) {
      if (thresholdDates.length <= i) {
        thresholdDates.push('N/A')
      } else {
        thresholdDates[i] = formatDate(new Date(thresholdDates[i]))
      }
    }
    setSiteActivationPercentages(thresholdDates)
  }

  const setPatientEnrollmentThresholds = () => {
    let count = 1
    const enrollment = [...enrollmentData]
      .filter(d => !!d.actualEnrollment)
      .sort((a, b) => a.date < b.date ? -1 : 1)
      .map(d => ({ date: d.date, enrollment: +d.actualEnrollment }))

    const thresholdDates = enrollment.reduce((dates, d) => {
      const count = dates.indexOf('N/A')
      let newDates = [...dates]
      if (d.enrollment / enrollmentGoal >= (count + 1) * 0.25) {
        newDates[count] = formatDate(new Date(d.date))
      }
      return [...newDates]
    }, ['N/A', 'N/A', 'N/A', 'N/A'])

    setPatientEnrollmentPercentages(thresholdDates)
    setPatientEnrollmentPercentages(thresholdDates)
  }

  useEffect(() => {
    setFirstIRBApprovedDate(earliestDate('dateIrbApproval'))
    setFirstSiteActivationDate(earliestDate('dateSiteActivated'))
    setFirstSubjectEnrolled(earliestDate('fpfv'))
    setSiteActivationThresholds()
    setPatientEnrollmentThresholds()
  }, [])

  const activeSitesCount = () => {
    const reducer = (count, site) => (isSiteActive(site) ? count + 1 : count)
    return sites.reduce(reducer, 0)
  }

  const activeSitesPercentage = useMemo(() => 100 * (activeSitesCount() / sitesCount).toFixed(2), [sites, enrollmentGoal])
  const enrollmentTotal = useMemo(() => sites.reduce((total, site) => total + site.patientsEnrolledCount, 0), [sites, enrollmentGoal])
  const enrollmentPercentage = useMemo(() => 100 * (enrollmentTotal / enrollmentGoal).toFixed(2), [sites, enrollmentGoal])

  useEffect(() => {
    if (sites) {
      const reducer = (counts, site) => {
        const { patientsConsentedCount, patientsEnrolledCount, patientsWithdrawnCount, patientsExpectedCount } = site
        return {
          consented: counts.consented + parseInt(patientsConsentedCount || 0),
          enrolled: counts.enrolled + parseInt(patientsEnrolledCount || 0),
          withdrawn: counts.withdrawn + parseInt(patientsWithdrawnCount || 0),
          expected: counts.expected + parseInt(patientsExpectedCount || 0),
        }
      }
      setPatientCounts(sites.reduce(reducer, patientCounts))
    }
  }, [])

  return (
    <Card style={{ height: '100%' }}>
      <CardHeader title="Milestones" />
        <Grid container style={{ height: '100%' }}>
          <Grid item xs={6} style={{ borderRight: '1px solid #ddd' }}>
            <CardContent>
              <Subsubheading align="center">Site Activation</Subsubheading>
              <br />
              { !sitesCount
                ? (
                  <Paragraph align="center">
                    This study has no no participating sites yet!
                  </Paragraph>
                ) : (
                  <Fragment>
                    <SitesActivationPieChart percentage={activeSitesPercentage} />
                    <Caption align="center">
                      {activeSitesCount()} of {sitesCount} sites
                    </Caption>
                    <br />
                    <List dense>
                      <ListItem>
                        <ListItemText primary="First IRB Approved" secondary={firstIRBApprovedDate}></ListItemText>
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="First Site Activated" secondary={firstSiteActivationDate}></ListItemText>
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={
                            <div>
                              25% Site Activation{' '}
                              ({ Math.ceil(sitesCount * 0.25) } / { sitesCount })
                            </div>
                          }
                          secondary={ siteActivationPercentages[0] }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={
                            <div>
                              50% Site Activation{' '}
                              ({ Math.ceil(sitesCount * 0.5) } / { sitesCount })
                            </div>
                          }
                          secondary={ siteActivationPercentages[1] }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={
                            <div>
                              75% Site Activation{' '}
                              ({ Math.ceil(sitesCount * 0.75) } / { sitesCount })
                            </div>
                          }
                          secondary={ siteActivationPercentages[2] }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={
                            <div>
                              100% Site Activation{' '}
                              ({ sitesCount } / { sitesCount })
                            </div>
                          }
                          secondary={ siteActivationPercentages[3] }
                        />
                      </ListItem>
                    </List>
                  </Fragment>
                )
              }
            </CardContent>
          </Grid>
          <Grid item xs={6}>
            <CardContent>
              <Subsubheading align="center">Patient Enrollment</Subsubheading>
              <br />
              <EnrollmentPieChart percentage={ enrollmentPercentage } />
              <Caption align="center">
                {enrollmentTotal} of {enrollmentGoal} enrolled
              </Caption>
              <br />
              <List dense>
                <ListItem>
                  <ListItemText primary="First Subject Enrolled" secondary={firstSubjectEnrolled}></ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <div>
                        25% Patient Enrollment{' '}
                        ({ Math.ceil(enrollmentGoal * 0.25) } / { enrollmentGoal })
                      </div>
                    }
                    secondary={ patientEnrollmentPercentages[0] }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <div>
                        50% Patient Enrollment{' '}
                        ({ Math.ceil(enrollmentGoal * 0.5) } / { enrollmentGoal })
                      </div>
                    }
                    secondary={ patientEnrollmentPercentages[1] }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <div>
                        75% Patient Enrollment{' '}
                        ({ Math.ceil(enrollmentGoal * 0.75) } / { enrollmentGoal })
                      </div>
                    }
                    secondary={ patientEnrollmentPercentages[2] }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={
                      <div>
                        100% Patient Enrollment{' '}
                        ({ enrollmentGoal } / { enrollmentGoal })
                      </div>
                    }
                    secondary={ patientEnrollmentPercentages[3] }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Grid>
        </Grid>
    </Card>
  )
}

