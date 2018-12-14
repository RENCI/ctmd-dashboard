import React from 'react'
import { Button } from '@material-ui/core'
import Page from '../components/Layout/Page'
import Heading from '../components/Typography/Heading'
import Paragraph from '../components/Typography/Paragraph'

const startProposalPage = (props) => {
    return (
        <Page>
            <Heading>Start a Proposal</Heading>
            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Molestias, optio.
            </Paragraph>
            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Debitis deleniti reprehenderit aliquam, quo quia ullam porro cum esse quaerat suscipit!
            </Paragraph>
                        
            <div style={{ textAlign: 'center' }}>
                <Button variant="outlined" color="primary">Get Started</Button>
            </div>

        </Page>
    )
}

export default startProposalPage