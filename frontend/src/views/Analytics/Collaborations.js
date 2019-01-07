import React, { Fragment } from 'react'

import Heading from '../../components/Typography/Heading'
import Paragraph from '../../components/Typography/Paragraph'

import ProposalsNetwork from '../../components/Visualizations/Proposals'

const classes = theme => ({
    root: { },
})

const collaborationsPage = (props) => {
    const apiUrl = process.env.NODE_ENV === 'production' ? 'https://pmd.renci.org/api/proposals/network' : 'http://localhost:3030/proposals/network'
    return (
        <Fragment className={ classes.root }>
        
            <Heading>Collaborations</Heading>

            <ProposalsNetwork apiUrl={ apiUrl } />

        </Fragment>
    )
}

export default collaborationsPage