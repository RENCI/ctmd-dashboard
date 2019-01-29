import React, { Fragment } from 'react'
import Heading from '../components/Typography/Heading'
import Subheading from '../components/Typography/Subheading'
import Paragraph from '../components/Typography/Paragraph'

import { AuthConsumer } from '../contexts/AuthContext'

const loginPage = (props) => {
    return (
        <Fragment>
            <Heading>Settings</Heading>
            
            <br/>

            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Praesentium necessitatibus velit assumenda aliquam sunt iusto a, possimus corporis numquam quisquam.
            </Paragraph>

        </Fragment>
    )
}

export default loginPage