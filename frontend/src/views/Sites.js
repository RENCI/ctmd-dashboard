import React, { useEffect, useState } from 'react'
import axios from 'axios'
import api from '../Api'
import { Title } from '../components/Typography'
import { CircularLoader } from '../components/Progress/Progress'
import { LookupTable } from '../components/Tables/LookupTable'

export const SitesPage = (props) => {
    const [sites, setSites] = useState(null)

    useEffect(() => {
        const fetchSites = async () => {
            await axios.get(api.sites)
                .then(response => setSites(response.data))
                .catch(error => console.error(error))
        }
        fetchSites()
    }, [])

    return (
        <div>
            <Title>Sites</Title>

            { sites ? <LookupTable data={ sites.map(site => ({ id: site.siteId, name: site.siteName })) } /> : <CircularLoader /> }
            
        </div>
    )
}
