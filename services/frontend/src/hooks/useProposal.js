import { useEffect, useState  } from 'react'
import axios from 'axios'
import api from '../Api'

export const useProposal = id => {
    const [proposal, setProposal] = useState(null)
    
    useEffect(() => {
        const fetchProposal = async () => {
            const result = await axios(api.oneProposal(id),  { withCredentials: true })
            setProposal(result.data[0])
        }
        fetchProposal()
    }, [api, id])
    
    return proposal
}
