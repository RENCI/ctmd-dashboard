import React from 'react'
import { Grid, List, ListItemIcon, ListItem, ListItemText } from '@material-ui/core'
import { DetailPanel } from './DetailPanel'
import { StarBullet } from '../../Bullets' 

export const SiteDetailPanel = props => {
    const {
        siteName, dateRegPacketSent, dateContractSent, dateIrbSubmission, dateIrbApproval, dateContractExecution, dateSiteActivated, lpfv, fpfv, patientsConsentedCount, patientsEnrolledCount, patientsWithdrawnCount, patientsExpectedCount, queriesCount, protocolDeviationsCount
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

    return (
        <DetailPanel heading={ siteName } subheading="Coordinating Center Metrics Report">

            <Grid container>
                <Grid item xs={ 12 } md={ 6 }>
                    <List>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Protocol Available to FPFV:" secondary={ fpfv } />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Contract approval/execution cycle time:" secondary={ dayCount(dateContractSent, dateContractExecution) } />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="IRB approval cycle time (Full Committee Review):" secondary={ dayCount(dateIrbSubmission, dateIrbApproval) } />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Site open to accrual to First Patient / First Visit (FPFV):" secondary={ fpfv || 'N/A' } />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Site open to accrual to Last Patient / First Visit:" secondary={ lpfv || 'N/A' } />
                        </ListItem>
                    </List>
                </Grid>

                <Grid item xs={ 12 } md={ 6 }>
                    <List>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Randomized patients / Consented patients:" secondary={ displayRatio(patientsEnrolledCount, patientsConsentedCount) } />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Actual vs expected randomized patient ratio:" secondary={ displayRatio(patientsEnrolledCount, patientsExpectedCount) } />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Ratio of randomized patients that dropout of the study:" secondary={ displayRatio(patientsWithdrawnCount, patientsEnrolledCount) } />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Major protocol deviations / randomized patient:" secondary={ displayRatio(protocolDeviationsCount, patientsEnrolledCount) } />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Queries per eCRF page:" secondary={ queriesCount || 'N/A' } />
                        </ListItem>
                    </List>
                </Grid>
            </Grid>

        </DetailPanel>
    )
}
