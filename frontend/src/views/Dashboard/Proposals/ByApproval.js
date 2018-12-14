import React from 'react'

import Heading from '../../../components/Typography/Heading'

import ApprovedProposals from '../../../components/Dashboard/Proposals/Approved'

const proposalsByApproval = (props) => {
    return (
        <div>
            <Heading>Proposals by Approval</Heading>

            <br/>

            <ApprovedProposals/>
            
        </div>
    )
}

export default proposalsByApproval