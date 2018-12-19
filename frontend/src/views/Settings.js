import React, { Fragment } from 'react'
import Heading from '../components/Typography/Heading'
import Subheading from '../components/Typography/Subheading'
import Paragraph from '../components/Typography/Paragraph'

import { AuthConsumer } from '../contexts/AuthContext'

const loginPage = (props) => {
    return (
        <AuthConsumer>
            {
                (context) => {
                    return (
                        <Fragment>
                            <Heading>Settings</Heading>

                            <Paragraph>
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Qui pariatur debitis ea!
                            </Paragraph>

                            <Subheading>Profile</Subheading>
                            
                            <Paragraph>
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit. A, rem.
                            </Paragraph>

                            <Subheading>Preferences</Subheading>
                            
                            <Paragraph>
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Praesentium necessitatibus velit assumenda aliquam sunt iusto a, possimus corporis numquam quisquam.
                            </Paragraph>

                        </Fragment>
                    )
                }
            }
        </AuthConsumer>
    )
}

export default loginPage