import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { ApiContext } from '../contexts/ApiContext'

export const useProposal = id => {
    const api = useContext(ApiContext)
    const [proposal, setProposal] = useState(null)
    
    useEffect(() => {
        const fetchProposal = async () => {
            const result = await axios(api.oneProposal(id))
            setProposal(result.data[0])
        }
        fetchProposal()
    }, [api, id])
    
    return proposal
}
