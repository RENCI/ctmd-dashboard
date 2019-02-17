import React, { useContext } from 'react'
import { ApiContext } from '../contexts/ApiContext'
import Heading from '../components/Typography/Heading'
import ProposalsNetwork from '../components/Visualizations/ProposalsNetworkContainer'

const collaborationsPage = (props) => {
    const api = useContext(ApiContext)
    return (
        <div>
            <Heading>Collaborations</Heading>

            <ProposalsNetwork apiUrl={ api.network } />
        </div>
    )
}

export default collaborationsPage