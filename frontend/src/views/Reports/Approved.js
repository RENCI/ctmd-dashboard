import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Heading from '../../components/Typography/Heading'

import ProposalsMatrix from '../../components/Charts/ProposalsMatrixApproved'
import { CircularLoader } from '../../components/Progress/Progress'

const proposalsUrl = process.env.NODE_ENV === 'production' ? 'https://pmd.renci.org/api/proposals/approved-services' : 'http://localhost:3030/proposals/approved-services'
const servicesUrl = process.env.NODE_ENV === 'production' ? 'https://pmd.renci.org/api/services/approval' : 'http://localhost:3030/services/approval'

const ProposalsByApproval = (props) => {
    const [proposals, setProposals] = useState([])
    const [services, setServices] = useState([])

    useEffect(() => {
        const proposalsPromise = axios.get(proposalsUrl)
        const servicesPromise = axios.get(servicesUrl)
        Promise.all([proposalsPromise, servicesPromise])
            .then((response) => {
                setProposals(response[0].data)
                setServices(response[1].data)
            })
            .catch(error => console.error('Error:', error))
    }, [])

    return (
        <div>
            <Heading>Approved Proposals</Heading>

            {
                (proposals.length > 0 && services.length > 0)
                ? <ProposalsMatrix proposals={ proposals } services={ services }/>
                : <CircularLoader/>
            }
            
        </div>
    )
}

export default ProposalsByApproval