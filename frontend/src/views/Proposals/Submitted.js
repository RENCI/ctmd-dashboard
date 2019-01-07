import React from 'react'

import Heading from '../../components/Typography/Heading'

import Proposals from '../../components/Tables/ProposalsTable'

const submittedProposals = (props) => {
    
    const apiRoot = process.env.NODE_ENV === 'production' ? 'https://pmd.renci.org/api/proposals/submitted' : 'http://localhost:3030/proposals/submitted'
    
    return (
        <div>
            <Heading>Submitted Proposals</Heading>

            <br/>

            <Proposals apiRoot={ apiRoot }/>
            
        </div>
    )
}

export default submittedProposals