import React from 'react'

import Heading from '../../../components/Typography/Heading'

import ApprovedProposals from '../../../components/Dashboard/Proposals/Approved'

const proposalsByApproval = (props) => {
    const apiRoot = process.env.NODE_END === 'production' ? 'https://pmd.renci.org/api' : 'http://localhost:3030'
    return (
        <div>
            <Heading>Proposals by Approval</Heading>

            <br/>

            <ApprovedProposals apiRoot={ apiRoot }/>
            
        </div>
    )
}

export default proposalsByApproval