import React from 'react'
import api from '../Api'
import { Grid, Card, CardHeader, CardContent } from '@material-ui/core'
import { Title, Subheading } from '../components/Typography'
import { DropZone } from '../components/Forms'

export const UploadsPage = props => {
    return (
        <div>
            <Title>Uploads</Title>

            <Grid container spacing={ 8 }>

                <Grid item xs={ 12 }>
                    <Subheading>Global Uploads</Subheading>
                </Grid>

                <Grid item xs={ 12 } md={ 6 }>
                    <Card>
                        <CardHeader title="Upload Sites" />
                        <CardContent>
                            <DropZone method="POST" endpoint={ api.uploadSites } />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={ 12 } md={ 6 }>
                    <Card>
                        <CardHeader title="Upload CTSAs" />
                        <CardContent>
                            <DropZone method="POST" endpoint={ api.uploadCtsas } />
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>

            <br/><br/><br/>
                
            <Grid container spacing={ 8 }>

                <Grid item xs={ 12 }>
                    <Subheading>Per-Study Uploads</Subheading>
                </Grid>

                <Grid item xs={ 12 } md={ 4 }>
                    <Card>
                        <CardHeader title="Upload Study Profile" />
                        <CardContent>
                            <DropZone method="POST" endpoint={ api.uploadStudyProfile } />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={ 12 } md={ 4 }>
                    <Card>
                        <CardHeader title="Upload Study Sites" />
                        <CardContent>
                            <DropZone method="POST" endpoint={ api.uploadStudySites } />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={ 12 } md={ 4 }>
                    <Card>
                        <CardHeader title="Upload Study Enrollment Data" />
                        <CardContent>
                            <DropZone method="POST" endpoint={ api.uploadStudyEnrollmentData } />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

        </div>
    )
}