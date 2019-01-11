import React from 'react'

import Heading from '../../components/Typography/Heading'

import ProposalsTable from '../../components/Tables/ProposalsTable'
import ProposalsMatrix from '../../components/Charts/ProposalsMatrix'

const proposalsByApproval = (props) => {

    const apiUrl = process.env.NODE_ENV === 'production' ? 'https://pmd.renci.org/api/proposals/approved' : 'http://localhost:3030/proposals/approved'

    return (
        <div>
            <Heading>Approved Proposals</Heading>

            <br/>

            <ProposalsMatrix apiUrl={ apiUrl }/>
            
        </div>
    )
}

export default proposalsByApproval