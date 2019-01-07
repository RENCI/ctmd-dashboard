import React from 'react'

import Heading from '../../components/Typography/Heading'

import Proposals from '../../components/Tables/ProposalsTable'

const proposalsByApproval = (props) => {

    const apiRoot = process.env.NODE_ENV === 'production' ? 'https://pmd.renci.org/api/proposals/approved' : 'http://localhost:3030/proposals/approved'

    return (
        <div>
            <Heading>Approved Proposals</Heading>

            <br/>

            <Proposals apiRoot={ apiRoot }/>
            
        </div>
    )
}

export default proposalsByApproval