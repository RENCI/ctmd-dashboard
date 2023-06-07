import React from 'react'
import { Grid, List, ListItemIcon, ListItem, ListItemText } from '@material-ui/core'
import { DetailPanel } from './DetailPanel'
import { StarBullet } from '../../Bullets' 
import { dayCountDisplay, percentDisplay, invalidDisplay } from '../../../utils/sites'

const displayRatioAsWholeNumberString = (a, b) => {
    return b === 0 ? invalidDisplay : `${ Math.round(a / b) } ≈ ${ a } / ${ b }`
}

export const SiteDetailPanel = props => {
    const {
        siteName, dateRegPacketSent, dateContractSent, dateIrbSubmission, dateIrbApproval,
        dateContractExecution, dateSiteActivated, lpfv, fpfv, patientsConsentedCount, patientsEnrolledCount,
        patientsWithdrawnCount, patientsExpectedCount, queriesCount, protocolDeviationsCount,
    } = props
    
    return (
        <DetailPanel heading={ siteName } subheading="Coordinating Center Metrics Report">

            <Grid container>
                <Grid item xs={ 12 } md={ 6 }>
                    <List>
                      


                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Activation (protocol to FPFV):" secondary={ dayCountDisplay(dateRegPacketSent, fpfv) } />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Contract execution time:" secondary={ dayCountDisplay(dateContractSent, dateContractExecution) } />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="sIRB approval time:" secondary={ dayCountDisplay(dateIrbSubmission, dateIrbApproval) } />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Site open to FPFV:" secondary={ dayCountDisplay(dateSiteActivated, fpfv) } />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Site open to LPFV:" secondary={ dayCountDisplay(dateSiteActivated, lpfv)  } />
                        </ListItem>
                    </List>
                </Grid>

                <Grid item xs={ 12 } md={ 6 }>
                    <List>


                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Percent of consented patients randomized:" secondary={ percentDisplay(patientsEnrolledCount, patientsConsentedCount)  } />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Actual to expected randomized patient ratio:" secondary={ percentDisplay(patientsEnrolledCount, patientsExpectedCount) } />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Ratio of randomized patients that dropped out of the study:" secondary={ percentDisplay(patientsWithdrawnCount, patientsEnrolledCount) } />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Major protocol deviations per randomized patients:" secondary={ percentDisplay( protocolDeviationsCount, patientsEnrolledCount) } />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><StarBullet /></ListItemIcon>
                            <ListItemText primary="Queries per patient:" secondary={ displayRatioAsWholeNumberString(queriesCount, patientsConsentedCount) } />
                        </ListItem>
                    </List>
                </Grid>
            </Grid>

        </DetailPanel>
    )
}
