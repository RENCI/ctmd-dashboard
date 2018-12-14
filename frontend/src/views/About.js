import React from 'react'
import Page from '../components/Layout/Page'
import Heading from '../components/Typography/Heading'
import Subheading from '../components/Typography/Subheading'
import Paragraph from '../components/Typography/Paragraph'
import TextLink from '../components/Typography/TextLink'

const startProposalPage = (props) => {
    return (
        <Page>
            <Heading>What is the Trial Innovation Center?</Heading>

            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod saepe eveniet beatae soluta sed omnis perspiciatis odio, optio iure, vitae dolorem sint velit, in. Quibusdam modi temporibus, ipsa autem! Eligendi.
            </Paragraph>

            <Subheading>Who We Are</Subheading>

            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod saepe eveniet beatae soluta sed omnis perspiciatis odio, optio iure, vitae dolorem sint velit, in. Quibusdam modi temporibus, ipsa autem! Eligendi.
            </Paragraph>
            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem, iste, alias.
            </Paragraph>
            
            <Subheading>What We do</Subheading>

            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem, iste, alias.
            </Paragraph>
            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod saepe eveniet beatae soluta sed omnis perspiciatis odio, optio iure, vitae dolorem sint velit, in. Quibusdam modi temporibus, ipsa autem! Eligendi.
            </Paragraph>
            
            <Heading>The Life of a Proposal</Heading>

            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Molestias, optio.
            </Paragraph>
            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Debitis deleniti reprehenderit aliquam, quo quia ullam porro cum esse quaerat suscipit!
            </Paragraph>
            
            <Subheading>Services We Offer</Subheading>

            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quibusdam quas rem id sequi architecto, tenetur illo, sed reprehenderit ad quis nostrum, sint esse a eaque necessitatibus quo rerum suscipit distinctio voluptate corporis in quos. Nostrum inventore, veniam officiis ducimus, unde dolor. Dolores ratione, illum ipsam commodi veniam recusandae tempore dicta repellat omnis quaerat libero, fugiat optio!
            </Paragraph>

            <Subheading>Connect with Local Experts</Subheading>

            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Odio minus, possimus sit, reprehenderit quia iusto quam id maiores illum. Aliquid modi cupiditate sit ab eum.
            </Paragraph>
            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facere voluptate, voluptates magni.
            </Paragraph>

            <Subheading>Learn About the Proposal Process and Get Started</Subheading>

            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eum, consectetur sequi perspiciatis esse cumque dicta nulla ad animi ducimus, ex vero quo voluptatem!
            </Paragraph>
            
            <Paragraph>
                Interested in learning more about <TextLink to="start-proposal">starting a proposal</TextLink>?
            </Paragraph>

        </Page>
    )
}

export default startProposalPage