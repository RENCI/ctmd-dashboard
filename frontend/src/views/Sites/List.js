import React, { useContext } from 'react'
import { StoreContext } from '../../contexts/StoreContext'
import { Title } from '../../components/Typography'
import { SitesTable } from '../../components/Tables'

export const SitesListPage = props => {
    const [store, ] = useContext(StoreContext)

    return (
        <div>
            <Title>Sites</Title>
            
            <SitesTable sites={ store.sites } paging={ true } />
        </div>
    )
}
