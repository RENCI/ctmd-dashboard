import React from 'react'
import Page from '../components/Layout/Page'
import Heading from '../components/Typography/Heading'
import Paragraph from '../components/Typography/Paragraph'

import { AuthConsumer } from '../contexts/AuthContext'

const logoutPage = (props) => {
    return (
        <AuthConsumer>
            {
                (context) => {
                    return <Page noMenu noFooter>
                        <Heading>Dashboard Logout</Heading>
                        
                        <Paragraph>
                            You have successfully logged out.
                        </Paragraph>

                    </Page>
                }
            }
        </AuthConsumer>
    )
}

export default logoutPage