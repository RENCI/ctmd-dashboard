import React from 'react'
import Page from '../components/Layout/Page'
import Heading from '../components/Typography/Heading'
import Subheading from '../components/Typography/Subheading'
import Paragraph from '../components/Typography/Paragraph'
import ContactForm from '../components/Forms/Contact'

const contactPage = (props) => {
    return (
        <Page>
            <Heading>Contact</Heading>
            
            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Numquam nisi recusandae alias atque odio, et voluptas illo eaque, obcaecati ut.
            </Paragraph>

            <Subheading>Send us a Message!</Subheading>

            <ContactForm />

            <Subheading>Get in Touch by Phone</Subheading>

            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Placeat modi consequuntur amet maxime neque quidem doloribus dolorum aspernatur in nam ratione corrupti eaque quam, temporibus distinctio, at sequi magnam officia.30
            </Paragraph>

            <Subheading>Location</Subheading>

            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Placeat modi consequuntur amet maxime neque quidem doloribus dolorum aspernatur in nam ratione corrupti eaque quam, temporibus distinctio, at sequi magnam officia.30
            </Paragraph>
        </Page>
    )
}

export default contactPage