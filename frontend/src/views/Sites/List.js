import React, { useContext } from 'react'
import { StoreContext } from '../../contexts/StoreContext'
import { Heading } from '../../components/Typography'
import SitesTable from '../../components/Tables/SitesTable'

export const SitesListPage = props => {
    const [store, ] = useContext(StoreContext)

    return (
        <div>
            <Heading>Sites</Heading>
            
            <SitesTable sites={ store.sites } paging={ true } />
        </div>
    )
}
