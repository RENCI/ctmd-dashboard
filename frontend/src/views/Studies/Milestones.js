import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent, List, ListItem, ListItemText } from '@material-ui/core'
import { Subsubheading, Caption } from '../../components/Typography'
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

export const Milestones = ({ sites }) => {
  const [patientCounts, setPatientCounts] = useState({ consented: 0, enrolled: 0, withdrawn: 0, expected: 0 })
  const [firstIRBApprovedDate, setFirstIRBApprovedDate] = useState()
  const [firstSiteActivationDate, setFirstSiteActivationDate] = useState()
  const [firstSubjectEnrolled, setFirstSubjectEnrolled] = useState()
  const [siteActivationPercentages, setSiteActivationPercentages] = useState([null, null, null, null])

  const earliestDate = (property) => {
    const reducer = (earliestDate, date) => (date < new Date(earliestDate) ? date : earliestDate)
    const earliestDate = sites
      .map((site) => site[property])
      .filter((date) => date !== '')
      .map((date) => new Date(date))
      .reduce(reducer, new Date())
    return formatDate(earliestDate)
  }

  const thresholds = (property) => {
    const quartileSize = Math.round(sites.length / 4)
    const activationDates = sites
      .map((site) => site[property])
      .filter((date) => date !== '')
      .map((date) => new Date(date))
      .sort((d1, d2) => d1 - d2)

    const dates = activationDates.chunk(quartileSize).map((chunk) => formatDate(chunk[chunk.length - 1]))
    for (let i = 0; i < 4; i++) {
      if (!dates[i]) {
        dates[i] = 'N/A'
      }
    }
    setSiteActivationPercentages(dates)
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

  const activeSitesPercentage = () => 100 * (activeSitesCount() / sites.length).toFixed(2)

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
      <CardContent>
        <Subsubheading align="center">Site Activation</Subsubheading>
        <SitesActivationPieChart percentage={activeSitesPercentage()} />
        <Caption align="center">
          {activeSitesCount()} of {sites.length} sites
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
            <ListItemText primary="25% Sites Activated" secondary={siteActivationPercentages[0]}></ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText primary="50% Sites Activated" secondary={siteActivationPercentages[1]}></ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText primary="75% Sites Activated" secondary={siteActivationPercentages[2]}></ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText primary="100% Sites Activated" secondary={siteActivationPercentages[3]}></ListItemText>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  )
}
