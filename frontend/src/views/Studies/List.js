import React, { useContext, useEffect, useState } from 'react'
import { StoreContext } from '../../contexts/StoreContext'
import { Heading } from '../../components/Typography'
import StudiesTable from '../../components/Tables/StudiesTable'

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

            <Heading>
                Studies
            </Heading>
            
            <StudiesTable studies={ studies } paging={ true } />
            
        </div>
    )
}
