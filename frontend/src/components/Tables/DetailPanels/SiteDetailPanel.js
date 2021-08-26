import React from 'react'
import { Grid, List, ListItemIcon, ListItem, ListItemText } from '@material-ui/core'
import { DetailPanel } from './DetailPanel'
import { StarBullet } from '../../Bullets' 
import { formatDate } from '../../../utils/DateFormat'

export const SiteDetailPanel = props => {
    const {
        siteName, dateRegPacketSent, dateContractSent, dateIrbSubmission, dateIrbApproval, dateContractExecution, dateSiteActivated, lpfv, fpfv, patientsConsentedCount, patientsEnrolledCount, patientsWithdrawnCount, patientsExpectedCount, queriesCount, protocolDeviationsCount, dataElement
    } = props
    const dayCount = (startDate, endDate) => {
        if (startDate && endDate) {
            const num = Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
            return `${ num } day${ num === 1 ? '' : 's' }`
        } else {
            return 'N/A'
        }
    }

    const displayRatio = (a, b, precision = 2) => {
        a = parseInt(a)
        b = parseInt(b)
        if ( !a || !b ) {
            return 'N/A'
        }
        if (a === 0) {
            if (b === 0) return `N/A`
            return `0% (${ a }/${ b })`
        }
        return b !== 0
            ? `${ (100 * a/b).toFixed(precision) }% (${ a }/${ b })`
            : `N/A`
    }

    const dateRangeFormat = (a, b) => {
        start = a && a !== '' ? `${formatDate(new Date(a))}` : 'N/A'
        end = b && b !== '' ? `${formatDate(new Date(b))}` : 'N/A'
        return `${start} - ${end}`
    }

    return (
        <DetailPanel heading={ siteName } subheading="Coordinating Center Metrics Report">

            <Grid container>
                <Grid item xs={ 12 } md={ 6 }>
                    <List>
                      


                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Activation (Protocol to FPFV):" secondary={`${dateRangeFormat(dateRegPacketSent, fpfv)} (${dayCount(dateRegPacketSent, fpfv)})`}/>
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Contract execution time:" secondary={`${dateRangeFormat(dateContractSent, dateContractExecution)} (${dayCount(dateContractSent, dateContractExecution)})`}/>
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="sIRB Approval time:" secondary={`${dateRangeFormat(dateIrbSubmission, dateIrbApproval)} (${dayCount(dateIrbSubmission, dateIrbApproval)})`}/>
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Site open to FPFV:" secondary={`${dateRangeFormat(dateSiteActivated, fpfv)} (${dayCount(dateSiteActivated, fpfv)})`}/>
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Site open to LPFV:" secondary={`${dateRangeFormat(dateSiteActivated, lpfv)} (${dayCount(dateSiteActivated, lpfv)})`}/>
                        </ListItem>
                    </List>
                </Grid>

                <Grid item xs={ 12 } md={ 6 }>
                    <List>


                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Percent of consented patients randomized:" secondary={`${patientsEnrolledCount || 'N/A'} - ${patientsConsentedCount || 'N/A'} (${displayRatio(patientsEnrolledCount, patientsConsentedCount)})`}/>
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Actual to expected randomized patient ratio:" secondary={`${patientsEnrolledCount || 'N/A'} - ${patientsExpectedCount || 'N/A'} (${displayRatio(patientsEnrolledCount, patientsExpectedCount)})`}/>
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Ratio of randomized patients that dropout of the study:" secondary={`${patientsWithdrawnCount || 'N/A'} - ${patientsEnrolledCount || 'N/A'} (${displayRatio(patientsWithdrawnCount, patientsEnrolledCount)})`}/>
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Major Protocol deviations per randomized patients:" secondary={`${protocolDeviationsCount || 'N/A'} - ${patientsEnrolledCount || 'N/A'} (${displayRatio(protocolDeviationsCount, patientsEnrolledCount)})`}/>
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Queries per data elements:" secondary={`${queriesCount || 'N/A'} - ${dataElement || 'N/A'} (${displayRatio(queriesCount, dataElement)})`}/>
                        </ListItem>
                    </List>
                </Grid>
            </Grid>

        </DetailPanel>
    )
}
