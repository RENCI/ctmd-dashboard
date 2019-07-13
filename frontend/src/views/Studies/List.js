import React, { useContext, useEffect, useState } from 'react'
import { StoreContext } from '../../contexts/StoreContext'
import { Title } from '../../components/Typography'
import { StudiesTable } from '../../components/Tables'

const studiesIds = [171, 186]

export const StudiesListPage = props => {
    const [store, ] = useContext(StoreContext)
    const [studies, setStudies] = useState([])

    useEffect(() => {
        if (store.proposals) {
            const onlyStudies = store.proposals.filter(({ proposalID }) => studiesIds.includes(proposalID))
            setStudies(onlyStudies)
        }
    }, [store.proposals])

    return (
        <div>

            <Title>Studies</Title>
            
            <StudiesTable studies={ studies } paging={ true } />
            
        </div>
    )
}
