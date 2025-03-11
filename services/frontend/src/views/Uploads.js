import React from 'react'
import api from '../Api'
import { Grid, Card, CardHeader, CardContent } from '@material-ui/core'
import { Title, Subheading } from '../components/Typography'
import { DropZone } from '../components/Forms'
import { DownloadButton } from '../components/Forms'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles((theme) => ({
  action: {
    height: 'initial',
  },
}))

export const UploadsPage = (props) => {
  const classes = useStyles()
  return (
    <div>
      <Title>Uploads</Title>

      <Grid container spacing={8}>
        <Grid item xs={12}>
          <Subheading>Global Uploads</Subheading>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Upload Sites"
              classes={{ action: classes.action }}
              action={<DownloadButton path={api.download('sites')} tooltip="Download Sites CSV Template" />}
            />
            <CardContent>
              <DropZone method="POST" endpoint={api.uploadSites} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Upload CTSAs"
              classes={{ action: classes.action }}
              action={<DownloadButton path={api.download('ctsas')} tooltip="Download CTSAs CSV Template" />}
            />
            <CardContent>
              <DropZone method="POST" endpoint={api.uploadCtsas} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <br />
      <br />
      <br />

      <Grid container spacing={8}>
        <Grid item xs={12}>
          <Subheading>Per-Study Uploads</Subheading>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title="Upload Study Profile"
              classes={{ action: classes.action }}
              action={
                <DownloadButton path={api.download('study-profile')} tooltip="Download Study Profile CSV Template" />
              }
            />
            <CardContent>
              <DropZone method="POST" endpoint={api.uploadStudyProfile} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title="Upload Study Sites"
              classes={{ action: classes.action }}
              action={<DownloadButton path={api.download('study-sites')} tooltip="Download Study Sites CSV Template" />}
            />
            <CardContent>
              <DropZone method="POST" endpoint={api.uploadStudySites} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title="Upload Study Enrollment Data"
              classes={{ action: classes.action }}
              action={<DownloadButton path={api.download('enrollment')} tooltip="Download Enrollment CSV Template" />}
            />
            <CardContent>
              <DropZone method="POST" endpoint={api.uploadStudyEnrollmentData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}
