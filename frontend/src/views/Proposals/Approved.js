import React from 'react'

import Heading from '../../components/Typography/Heading'

import ProposalsMatrix from '../../components/Charts/ProposalsMatrixApproved'

const proposalsByApproval = (props) => {

    const proposalsUrl = process.env.NODE_ENV === 'production' ? 'https://pmd.renci.org/api/proposals/approved-services' : 'http://localhost:3030/proposals/approved-services'
    const servicesUrl = process.env.NODE_ENV === 'production' ? 'https://pmd.renci.org/api/services/approval' : 'http://localhost:3030/services/approval'

    return (
        <div>
            <Heading>Approved Proposals</Heading>

            <br/>

            <ProposalsMatrix proposalsUrl={ proposalsUrl } servicesUrl={ servicesUrl }/>
            
        </div>
    )
}

export default proposalsByApproval