import React, { useEffect, useState } from 'react'
import axios from 'axios'
import api from '../Api'
import { Title } from '../components/Typography'
import { CircularLoader } from '../components/Progress/Progress'
import { LookupTable } from '../components/Tables/LookupTable'

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
            <Title>CTSAs</Title>

            { ctsas ? <LookupTable data={ ctsas.map(ctsa => ({ id: ctsa.ctsaId, name: ctsa.ctsaName })) } /> : <CircularLoader /> }
            
        </div>
    )
}
