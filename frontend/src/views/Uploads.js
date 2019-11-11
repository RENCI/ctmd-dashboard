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
                            <DropZone endpoint={ `${ api.uploadSites }/column/siteId` } />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={ 12 } md={ 6 }>
                    <Card>
                        <CardHeader title="Upload CTSAs" />
                        <CardContent>
                            <DropZone endpoint={ `${ api.uploadCtsas }/column/ctsaId` } />
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
                            <DropZone endpoint={ `${ api.uploadStudyProfile }/column/ProposalID` } />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={ 12 } md={ 4 }>
                    <Card>
                        <CardHeader title="Upload Study Sites" />
                        <CardContent>
                            <DropZone endpoint={ `${ api.uploadStudySites }/column/ProposalID` } />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={ 12 } md={ 4 }>
                    <Card>
                        <CardHeader title="Upload Study Enrollment Data" />
                        <CardContent>
                            <DropZone endpoint={ `${ api.uploadStudyEnrollmentData }/column/ProposalID` } />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

        </div>
    )
}
