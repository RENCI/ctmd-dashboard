import React, { Fragment } from 'react'
import { Title, Paragraph } from '../../components/Typography'
import { Card, CardHeader, CardContent } from '@material-ui/core'

export const LoginPage = props => {
    return (
        <Fragment>
            <Title>Access Denied</Title>

            <Card>
                <CardHeader title="Login" />
                <CardContent>
                    <Paragraph>
                        Please login to the <a href="https://redcap.vanderbilt.edu/plugins/TIN/user/login" rel="noopener noreferrer">TIN Dashboard</a> to view this page.
                        Click the button below if you are already logged in to the TIN Dashboard.
                    </Paragraph>
                    <Paragraph center>
                        <form method="POST" action={ `https://redcap.vanderbilt.edu/plugins/TIN/sso/send_login?target-url=${ window.location.host }/auth` }>
                          <input type="submit" class="login-button" value="Login" />
                        </form>
                    </Paragraph>
                </CardContent>
          </Card>
        </Fragment>
    )
}
