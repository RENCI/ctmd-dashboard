import React, { Fragment } from 'react'

import Heading from '../../../components/Typography/Heading'
import Paragraph from '../../../components/Typography/Paragraph'

const classes = theme => ({
    root: { },
})

const collaborationsPage = (props) => {
    return (
        <Fragment className={ classes.root }>
            <Heading>Collaborations</Heading>

            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsum doloribus distinctio praesentium asperiores quod sequi impedit porro earum vel minus reiciendis alias maxime, maiores vitae, officiis suscipit beatae sapiente incidunt. Rerum tenetur fuga praesentium iusto explicabo placeat ad beatae et alias, officia, possimus doloremque dolores nostrum? Similique provident, eligendi officiis.
            </Paragraph>

        </Fragment>
    )
}

export default collaborationsPage