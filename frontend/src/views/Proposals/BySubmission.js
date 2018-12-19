import React from 'react'

import Heading from '../../components/Typography/Heading'

import SubmittedProposals from '../../components/Dashboard/Proposals/Submitted'

const proposalsBySubmission = (props) => {
    
    const apiRoot = process.env.NODE_ENV === 'production' ? 'https://pmd.renci.org/api' : 'http://localhost:3030'
    
    return (
        <div>
            <Heading>Proposals by Approval</Heading>

            <br/>

            <SubmittedProposals apiRoot={ apiRoot }/>
            
        </div>
    )
}

export default proposalsBySubmission