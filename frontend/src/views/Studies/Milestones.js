import React, { Fragment, useEffect, useState } from 'react'
import { Card, CardHeader, CardContent, List, ListItem, ListItemText } from '@material-ui/core'
import { Subsubheading, Caption, Paragraph } from '../../components/Typography'
import { SitesActivationPieChart } from '../../components/Charts'
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

export const Milestones = ({ sites, sitesCount }) => {
  // console.table(sites.map(site => ({
  //   dateContractExecution: site.dateContractExecution,
  //   dateContractSent: site.dateContractSent,
  //   dateIrbApproval: site.dateIrbApproval,
  //   dateIrbSubmission: site.dateIrbSubmission,
  //   dateRegPacketSent: site.dateRegPacketSent,
  // })))
  const [patientCounts, setPatientCounts] = useState({ consented: 0, enrolled: 0, withdrawn: 0, expected: 0 })
  const [firstIRBApprovedDate, setFirstIRBApprovedDate] = useState()
  const [firstSiteActivationDate, setFirstSiteActivationDate] = useState()
  const [firstSubjectEnrolled, setFirstSubjectEnrolled] = useState()
  const [siteActivationPercentages, setSiteActivationPercentages] = useState([null, null, null, null])

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

  const thresholds = property => {
    let count = 0
    let thresholdDates = []

    const dates = sites
      .map(site => site[property])
      .filter(date => !!date)
      .sort((d1, d2) => d1 < d2 ? -1 : 1)    
    let percentage = 0.25
    dates.forEach(date => {
      if (!!date) {
        count += 1
        if (count / sites.length >= 0.25 + 0.25 * thresholdDates.length) {
          thresholdDates.push(date)
        }
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

  useEffect(() => {
    setFirstIRBApprovedDate(earliestDate('dateIrbApproval'))
    setFirstSiteActivationDate(earliestDate('dateSiteActivated'))
    setFirstSubjectEnrolled(earliestDate('fpfv'))
    thresholds('dateSiteActivated')
  }, [])

  const activeSitesCount = () => {
    const reducer = (count, site) => (isSiteActive(site) ? count + 1 : count)
    return sites.reduce(reducer, 0)
  }

  const activeSitesPercentage = () => 100 * (activeSitesCount() / sitesCount).toFixed(2)

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
      {
        !sitesCount ? (
          <CardContent>
            <Subsubheading align="center">Site Activation</Subsubheading>
            <Paragraph>
              This study has zero initial participating sites.
            </Paragraph>
          </CardContent>
        ) : (
          <Fragment>
            <CardContent>
              <Subsubheading align="center">Site Activation</Subsubheading>
              <SitesActivationPieChart percentage={activeSitesPercentage()} />
              <Caption align="center">
                {activeSitesCount()} of {sitesCount} sites
              </Caption>
            </CardContent>
            <CardContent>
              <List dense>
                <ListItem>
                  <ListItemText primary="First IRB Approved" secondary={firstIRBApprovedDate}></ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemText primary="First Site Activated" secondary={firstSiteActivationDate}></ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemText primary="First Subject Enrolled" secondary={firstSubjectEnrolled}></ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemText primary="25% of Sites Activated" secondary={siteActivationPercentages[0]}></ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemText primary="50% of Sites Activated" secondary={siteActivationPercentages[1]}></ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemText primary="75% of Sites Activated" secondary={siteActivationPercentages[2]}></ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemText primary="100% of Sites Activated" secondary={siteActivationPercentages[3]}></ListItemText>
                </ListItem>
              </List>
            </CardContent>
          </Fragment>
        )
      }
    </Card>
  )
}
