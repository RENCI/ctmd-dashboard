import React, { useState } from 'react'
import { Grid, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core'
import { StarBullet as StarIcon } from '../../components/Bullets' 

export const SitesReport = ({ sites }) => {
    const [fpfv, ] = useState()
    const [contractCycleTime, ] = useState()
    const [irbCycleTime, ] = useState()
    const [lpfv, ] = useState()
    const [randomizedPatientRatio, ] = useState()
    const [expectedPatientRatio, ] = useState()
    const [withdrawnPatientRatio, ] = useState()
    const [protocolDeviations, ] = useState()
    const [queries, ] = useState()

    return (
        <Grid container>
            <Grid item xs={ 12 } md={ 6 }>
                <List>
                    <ListItem>
                        <ListItemIcon><StarIcon /></ListItemIcon>
                        <ListItemText primary="Activation (Protocol Available to FPFV):" secondary={ fpfv } />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><StarIcon /></ListItemIcon>
                        <ListItemText primary="Contract approval/execution cycle time:" secondary={ contractCycleTime } />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><StarIcon /></ListItemIcon>
                        <ListItemText primary="IRB approval cycle time (Full Committee Review):" secondary={ irbCycleTime } />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><StarIcon /></ListItemIcon>
                        <ListItemText primary="Site open to accrual to First Patient / First Visit (FPFV):" secondary={ fpfv } />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><StarIcon /></ListItemIcon>
                        <ListItemText primary="Site open to accrual to Last Patient / First Visit:" secondary={ lpfv } />
                    </ListItem>
                </List>
            </Grid>

            <Grid item xs={ 12 } md={ 6 }>
                <List>
                    <ListItem>
                        <ListItemIcon><StarIcon /></ListItemIcon>
                        <ListItemText primary="Randomized patients / Consented patients:" secondary={ randomizedPatientRatio } />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><StarIcon /></ListItemIcon>
                        <ListItemText primary="Actual vs expected randomized patient ratio:" secondary={ expectedPatientRatio } />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><StarIcon /></ListItemIcon>
                        <ListItemText primary="Ratio of randomized patients that dropout of the study:" secondary={ withdrawnPatientRatio } />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><StarIcon /></ListItemIcon>
                        <ListItemText primary="Major protocol deviations / randomized patient:" secondary={ protocolDeviations } />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><StarIcon /></ListItemIcon>
                        <ListItemText primary="Queries per eCRF page:" secondary={ queries } />
                    </ListItem>
                </List>
            </Grid>
        </Grid>
    )
}
