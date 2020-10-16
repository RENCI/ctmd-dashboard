import React, { Fragment } from 'react'
import { Title, Paragraph } from '../../components/Typography'
import { Card, CardHeader, CardContent, Button } from '@material-ui/core'

export const LoginPage = props => {
    return (
        <Fragment>
            <Title>Access Denied</Title>

            <Card>
                <CardHeader title="Login" />
                <CardContent>
                    <Paragraph>
                        You must be logged in to the <a href="https://redcap.vanderbilt.edu/plugins/TIN/user/login" rel="noopener noreferrer">TIN Dashboard</a> to view this site.
                    </Paragraph>
                    <Paragraph>
                        Click the button below to authenticate if you are already logged in to the TIN Dashboard.
                    </Paragraph>
                    <Paragraph center>
                        <form
                            method="POST"
                            action={ `https://redcap.vanderbilt.edu/plugins/TIN/sso/send_login?target-url=${ window.location.origin }/api/auth` }
                            style={{ display: 'flex', justifyContent: 'center' }} 
                        >
                            <input type="submit" value="Authenticate" />
                        </form>
                    </Paragraph>
                </CardContent>
          </Card>
        </Fragment>
    )
}
