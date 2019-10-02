import React, { useContext, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import api from '../Api'
import { useTheme } from '@material-ui/styles'
import { StoreContext } from '../contexts/StoreContext'
import { Grid, Card, CardHeader, CardContent, Button,} from '@material-ui/core'
import { Title, Subheading } from '../components/Typography'
import { DropZone } from '../components/Forms'

export const UploadsPage = props => {
    return (
        <div>
            <Title>Uploads</Title>

            <Grid container spacing={ 4 }>

                <Grid item xs={ 12 }>
                    <Subheading>Global Uploads</Subheading>
                </Grid>

                <Grid item xs={ 12 } md={ 6 }>
                    <Card>
                        <CardHeader title="Upload Sites" />
                        <CardContent>
                            <DropZone endpoint={ api.uploadSites } />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={ 12 } md={ 6 }>
                    <Card>
                        <CardHeader title="Upload CTSAs" />
                        <CardContent>
                            <DropZone endpoint={ api.uploadCtsas } />
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>

            <br/><br/><br/>
                
            <Grid container spacing={ 4 }>

                <Grid item xs={ 12 }>
                    <Subheading>Per-Study Uploads</Subheading>
                </Grid>

                <Grid item xs={ 12 } md={ 4 }>
                    <Card>
                        <CardHeader title="Upload Study Profile" />
                        <CardContent>
                            <DropZone endpoint={ api.uploadStudyProfile } />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={ 12 } md={ 4 }>
                    <Card>
                        <CardHeader title="Upload Study Sites" />
                        <CardContent>
                            <DropZone endpoint={ api.uploadStudySites } />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={ 12 } md={ 4 }>
                    <Card>
                        <CardHeader title="Upload Study Enrollment Data" />
                        <CardContent>
                            <DropZone endpoint={ api.uploadStudyEnrollmentData } />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

        </div>
    )
}
