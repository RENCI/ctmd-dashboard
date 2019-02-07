import React, { useState, useEffect } from 'react'
import axios from 'axios'

import Heading from '../../components/Typography/Heading'

import ProposalsByStageTable from '../../components/Charts/ProposalsByStage'
import { CircularLoader } from '../../components/Progress/Progress'

const stagesUrl = process.env.NODE_ENV === 'production' ? 'https://pmd.renci.org/api/proposals/by-stage' : 'http://localhost:3030/proposals/by-stage'

const proposalsByStage = (props) => {
    const [stages, setStages] = useState([])
    
    useEffect(() => {
        axios.get(stagesUrl)
            .then(response => setStages(response.data))
            .catch(error => console.error('Error:', error))
    }, [])

    return (
        <div>
            <Heading>
                Proposals by Stage
            </Heading>
            {
                stages.length > 0
                ? <ProposalsByStageTable proposalsByStage={ stages }/>
                : <CircularLoader/>
            }
        </div>
    )
}

export default proposalsByStage