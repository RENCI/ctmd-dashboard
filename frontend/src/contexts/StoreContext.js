import React, { useState, useEffect } from 'react'
import axios from 'axios'
import api from '../Api'

export const StoreContext = React.createContext({})

const initialStore = {
    proposals: [],
    organizations: [],
    tics: [],
    statuses: [],
    therapeuticAreas: [],
    services: [],
}

export const StoreProvider = ({ children }) => {
    const [store, setStore] = useState(initialStore)
    
    // Endpoints used from API Context Provider
    const promises = [
        axios.get(api.proposals),
        axios.get(api.organizations),
        axios.get(api.tics),
        axios.get(api.statuses),
        axios.get(api.therapeuticAreas),
        axios.get(api.resources),
        // axios.get(api.sites),
    ]

    const fetchStore = async () => {
        await Promise.all(promises)
            .then(response => {
                setStore({
                    ...store,
                    proposals: response[0].data,
                    organizations: response[1].data,
                    tics: response[2].data,
                    statuses: response[3].data,
                    therapeuticAreas: response[4].data,
                    services: response[5].data,
                    // sites: response[6].data,
                })
            })
            .catch(error => console.log('Error', error))
    }
    
    useEffect(() => {
        fetchStore()
    }, [])

    return (
        <StoreContext.Provider value={ [store, setStore] }>
            { children }
        </StoreContext.Provider>
    )
}
