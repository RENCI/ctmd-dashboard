import React from 'react'

import Heading from '../../components/Typography/Heading'

import ProposalsNetwork from '../../components/Visualizations/Proposals'

const classes = theme => ({
    root: { },
})

const collaborationsPage = (props) => {
    const apiUrl = process.env.NODE_ENV === 'production' ? 'https://pmd.renci.org/api/proposals/network' : 'http://localhost:3030/proposals/network'
    return (
        <div className={ classes.root }>
        
            <Heading>Collaborations</Heading>

            <ProposalsNetwork apiUrl={ apiUrl } />

        </div>
    )
}

export default collaborationsPage