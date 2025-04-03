import React, { Fragment } from 'react'
import { Title, Paragraph } from '../../components/Typography'
import { Card, CardHeader, CardContent, Button, List, ListItem } from '@material-ui/core'

export const LoginPage = (props) => {
  // const redirectURL = process.env.NODE_ENV === 'production' ? `${window.location.origin}/api/auth` : `${process.env.REACT_APP_API_ROOT}/auth`
  const redirectURL = process.env.NODE_ENV === 'production' ? `${window.location.origin}/api/auth` : 'http://localhost:3030/auth'
  return (
    <Fragment>
      <Title>Access Denied</Title>

      <Card>
        <CardHeader title="Login" />
        <CardContent>
          <Paragraph>You must be logged in to the TIN Dashboard to view this site.</Paragraph>
          <ol>
            <li>Log into the TIN Dashboard if you are not already.</li>
            <li>Navigate back to this page.</li>
            <li>Click the "Authenticate with TIN" button below to gain access to this site.</li>
          </ol>
          <Paragraph center>
            <form
              onSubmit={ (e) => {
                e.preventDefault()
                window.location.href = `https://redcap.vumc.org/plugins/TIN/sso/send_login?target-url=${encodeURIComponent(redirectURL)}`
              } }
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <Button type="submit" color="primary" variant="contained">
                Authenticate with TIN
              </Button>
            </form>
          </Paragraph>
        </CardContent>
      </Card>
    </Fragment>
  )
}

// open a new tab
// log into the tin Dashboard
// come back to stage
// click authenticate
