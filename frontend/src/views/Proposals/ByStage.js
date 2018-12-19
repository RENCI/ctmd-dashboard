import React from 'react'

import Heading from '../../components/Typography/Heading'
import Paragraph from '../../components/Typography/Paragraph'

import ProposalsInEachStage from '../../components/Charts/Bar/ProposalsInEachStage'

const proposalsByStage = (props) => {
    return (
        <div>
            <Heading>
                Proposals by Stage
            </Heading>

            <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Distinctio dolores corrupti, beatae quam, dolorum adipisci incidunt, temporibus accusantium fugit iure odio amet.
            </Paragraph>

            <ProposalsInEachStage />

        </div>
    )
}

export default proposalsByStage