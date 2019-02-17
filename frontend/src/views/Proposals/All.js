import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { ApiContext } from '../../contexts/ApiContext'
import Heading from '../../components/Typography/Heading'
import ProposalsTable from '../../components/Charts/ProposalsTable'
import { CircularLoader } from '../../components/Progress/Progress'

const proposalsTable = (props) => {
    const [proposals, setProposals] = useState([])
    const api = useContext(ApiContext)

    useEffect(() => {
        axios.get(api.proposals)
            .then((response) => setProposals(response.data))
            .catch(error => { console.error('Error:', error) })
    }, [])

    return (
        <div>
            <Heading>Proposals</Heading>
            {
                (proposals.length > 0)
                ? <ProposalsTable
                    proposals={ proposals }
                    paging={ true }
                />
                : <CircularLoader/>
            }
        </div>
    )
}

export default proposalsTable