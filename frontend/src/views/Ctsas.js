import React, { useEffect, useState } from 'react'
import axios from 'axios'
import api from '../Api'
import { Title } from '../components/Typography'
import { CircularLoader } from '../components/Progress/Progress'
import { LookupTable } from '../components/Tables/LookupTable'
import { Grid } from '@material-ui/core'
import { DropZone } from '../components/Forms/DropZone'
import { DownloadButton } from '../components/Forms'

export const CtsasPage = (props) => {
    const [ctsas, setCtsas] = useState(null)

    useEffect(() => {
        const fetchCtsas = async () => {
            await axios.get(api.ctsas)
                .then(response => setCtsas(response.data))
                .catch(error => console.error(error))
        }
        fetchCtsas()
    }, [])

    return (
        <div>
            <Grid container>
                <Grid item xs={ 11 } md={ 6 }>
                    <Title>CTSAs</Title>
                </Grid>
                <Grid item xs={ 11 } md={ 5 }>
                    <DropZone endpoint={ `${ api.uploadSites }` } />
                </Grid>
                <Grid item xs={ 1 } style={{ textAlign: 'right' }}>
                    <DownloadButton path={ api.download('ctsas')} tooltip="Download CTSAs CSV Template" />
                </Grid>
            </Grid>

            { ctsas ? <LookupTable data={ ctsas.map(ctsa => ({ id: ctsa.ctsaId, name: ctsa.ctsaName })) } /> : <CircularLoader /> }
            
        </div>
    )
}
