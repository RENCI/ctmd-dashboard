import React, { useContext } from 'react'
import { StoreContext } from '../../contexts/StoreContext'
import { Heading } from '../../components/Typography'
import { ProposalsTable } from '../../components/Tables'
import { BrowseMenu } from '../../components/Menus'

export const ProposalsListPage = (props) => {
    const [store, ] = useContext(StoreContext)

    return (
        <div>
            <Heading>
                Proposals <BrowseMenu />
            </Heading>
            
            <ProposalsTable proposals={ store.proposals } paging={ true } />
        </div>
    )
}
