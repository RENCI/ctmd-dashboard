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

  const Metric = React.useCallback(({ label, value }) => (
    <ListItem>
      <ListItemIcon><StarBullet /></ListItemIcon>
      <ListItemText primary={ label + ":" } secondary={ value } />
    </ListItem>
  ), [])

  return (
    <Grid container>
      <Grid item xs={ 12 } md={ 6 }>
        <List>
          <Metric
            label="Activation (protocol to FPFV)"
            value={ dayString(averageDays('dateRegPacketSent', 'fpfv')) }
          />
          <Metric
            label="Contract execution time"
            value={ dayString(averageDays('dateContractSent', 'dateContractExecution')) }
          />
          <Metric
            label="sIRB approval time"
            value={ dayString(averageDays('dateIrbSubmission', 'dateIrbApproval')) }
          />
          <Metric
            label="Site open to FPFV"
            value={ dayString(averageDays('dateSiteActivated', 'fpfv')) }
          />
          <Metric
            label="Site open to LPFV"
            value={ dayString(averageDays('dateSiteActivated', 'lpfv')) }
          />
        </List>
      </Grid>
      <Grid item xs={ 12 } md={ 6 }>
        <List>
          <Metric
            label="Percent of consented patients randomized"
            value={ ratioString(sum('patientsEnrolledCount'), sum('patientsConsentedCount')) }
          />
          <Metric
            label="Actual to expected randomized patient ratio"
            value={ ratioString(sum('patientsEnrolledCount'), sum('patientsExpectedCount')) }
          />
          <Metric
            label="Ratio of randomized patients that dropped out of the study"
            value={ ratioString(sum('patientsWithdrawnCount'), sum('patientsEnrolledCount')) }
          />
          <Metric
            label="Major protocol deviations per randomized patients"
            value={ ratioString(sum('protocolDeviationsCount'), sum('patientsEnrolledCount')) }        
          />
          <Metric
            label="Queries per total number of patients"
            value={ ratioString(sum('queriesCount'), sum('patientsConsentedCount')) }
          />
        </List>
      </Grid>
    </Grid>
  )
}

