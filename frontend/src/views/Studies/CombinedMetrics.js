import React from 'react'
import { Grid, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core'
import { StarBullet } from '../../components/Bullets' 

export const CombinedMetrics = ({ study, studyProfile, sites }) => {

  // XXX: Basically duplicating some work that adds some keys to site objects in the sites table. 
  //      This seems like a bad idea to modify the site objects directly outside of a store/context.
  //      For now, recompute here, but suggest centralizing this somehow.

  const invalidDisplay = 'N/A'

  const dayCount = (startDate, endDate) => {
    return startDate && endDate ? Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) : 0
  }

  const averageDays = (startKey, endKey) => {
    const total = sites.reduce((total, site) => {
      const start = site[startKey]
      const end = site[endKey]

      if (start && end) {
        total.sum += dayCount(start, end)
        total.numDays++
      }

      return total
    }, { sum: 0, numDays: 0 })

    return total.numDays === 0 ? -1 : total.sum / total.numDays
  }

  const dayString = numDays => {
    if (numDays < 0) return invalidDisplay

    const n = Math.round(numDays);

    return `${ n } day${ n === 1 ? '' : 's' }`
  }

  const sum = key => {
    return sites.reduce((sum, site) => sum + site[key], 0)
  }

  const ratioString = (a, b, precision = 2) => {
    return b === 0 ? invalidDisplay : `${ (100 * a/b).toFixed(precision) }% (${ a }/${ b })`
  }

  const item = (label, value) => (
    <ListItem>
      <ListItemIcon><StarBullet /></ListItemIcon>
      <ListItemText primary={ label + ":" } secondary={ value } />
    </ListItem>
  )

  return (
    <Grid container>
      <Grid item xs={ 12 } md={ 6 }>
        <List>
          { item('Activation (protocol to FPFV)', dayString(averageDays('dateRegPacketSent', 'fpfv'))) }
          { item('Contract execution time', dayString(averageDays('dateContractSent', 'dateContractExecution'))) }
          { item('sIRB approval time', dayString(averageDays('dateIrbSubmission', 'dateIrbApproval'))) }
          { item('Site open to FPFV', dayString(averageDays('dateSiteActivated', 'fpfv'))) }
          { item('Site open to LPFV', dayString(averageDays('dateSiteActivated', 'lpfv'))) }
        </List>
      </Grid>
      <Grid item xs={ 12 } md={ 6 }>
        <List>
          { item('Percent of consented patients randomized', ratioString(sum('patientsEnrolledCount'), sum('patientsConsentedCount'))) }
          { item('Actual to expected randomized patient ratio', ratioString(sum('patientsEnrolledCount'), sum('patientsExpectedCount'))) }
          { item('Ratio of randomized patients that dropped out of the study', ratioString(sum('patientsWithdrawnCount'), sum('patientsEnrolledCount'))) }
          { item('Major protocol deviations per randomized patients', ratioString(sum('protocolDeviationsCount'), sum('patientsEnrolledCount'))) }        
          { item('Queries per total number of patients', ratioString(sum('queriesCount'), sum('patientsConsentedCount'))) }
        </List>
      </Grid>
    </Grid>
  )
}

