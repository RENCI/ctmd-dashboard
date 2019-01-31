import React from 'react'

import Heading from '../components/Typography/Heading'

import ProposalsNetwork from '../components/Visualizations/ProposalsNetworkContainer'

const classes = theme => ({
    root: { },
})

const apiUrl = process.env.NODE_ENV === 'production' ? 'https://pmd.renci.org/api/proposals/network' : 'http://localhost:3030/proposals/network'

const collaborationsPage = (props) => {
    return (
        <div className={ classes.root }>
        
            <Heading>Collaborations</Heading>

            <ProposalsNetwork apiUrl={ apiUrl } />

        </div>
    )
}

export default collaborationsPage