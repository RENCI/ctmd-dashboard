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
                    </Paragraph>
                </CardContent>
          </Card>
        </Fragment>
    )
}
