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
            <Grid container>
                <Grid item xs={ 12 } sm={ 10 } component={ Title }>Sites</Grid>
                <Grid item xs={ 12 } sm={ 2 }>
                    <FileDrop />
                </Grid>
            </Grid>

            { sites ? <LookupTable data={ sites } /> : <CircularLoader /> }
            
        </div>
    )
}
