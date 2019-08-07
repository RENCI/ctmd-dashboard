import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import api from '../Api'
import { Title } from '../components/Typography'
import { Grid, Paper, Card, CardContent } from '@material-ui/core'
import { CircularLoader } from '../components/Progress/Progress'
import { LookupTable } from '../components/Tables/LookupTable'
import { FileDrop } from '../components/Forms'

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
            
            <Paper style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0 1rem', cursor: 'pointer' }}>
                <FileDrop />
            </Paper>

            { sites ? <LookupTable data={ sites } /> : <CircularLoader /> }
            
        </div>
    )
}
