import React from 'react'

import Heading from '../../components/Typography/Heading'
import Paragraph from '../../components/Typography/Paragraph'

import ProposalsInEachStage from '../../components/Charts/ProposalsInEachStage'

const proposalsByStage = (props) => {
    const proposalsUrl = process.env.NODE_ENV === 'production' ? 'https://pmd.renci.org/api/proposals' : 'http://localhost:3030/proposals'
    const stagesUrl = process.env.NODE_ENV === 'production' ? 'https://pmd.renci.org/api/stages' : 'http://localhost:3030/stages'

    return (
        <div>
            <Heading>
                Proposals by Stage
            </Heading>

            <ProposalsInEachStage proposalsUrl={ proposalsUrl } stagesUrl={ stagesUrl }/>

        </div>
    )
}

export default proposalsByStage