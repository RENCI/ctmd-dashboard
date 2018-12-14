import React from 'react'

import Heading from '../../../components/Typography/Heading'

import SubmittedProposals from '../../../components/Dashboard/Proposals/Submitted'

const proposalsBySubmission = (props) => {
    return (
        <div>
            <Heading>Proposals by Approval</Heading>

            <br/>

            <SubmittedProposals/>
            
        </div>
    )
}

export default proposalsBySubmission