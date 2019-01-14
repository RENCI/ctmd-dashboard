import React from 'react'

import Heading from '../../components/Typography/Heading'

import ProposalsMatrix from '../../components/Charts/ProposalsMatrixSubmitted'

const proposalsBySubmission = (props) => {
    
    const proposalsUrl = process.env.NODE_ENV === 'production' ? 'https://pmd.renci.org/api/proposals/submitted-services' : 'http://localhost:3030/proposals/submitted-services'
    const servicesUrl = process.env.NODE_ENV === 'production' ? 'https://pmd.renci.org/api/services/submission' : 'http://localhost:3030/services/submission'
    
    return (
        <div>
            <Heading>Submitted Proposals</Heading>

            <br/>

            <ProposalsMatrix proposalsUrl={ proposalsUrl } servicesUrl={ servicesUrl }/>
            
        </div>
    )
}

export default proposalsBySubmission