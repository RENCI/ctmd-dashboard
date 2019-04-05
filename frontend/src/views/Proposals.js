import React, { useContext } from 'react'
import { StoreContext } from '../contexts/StoreContext'
import { Heading } from '../components/Typography/Typography'
import ProposalsTable from '../components/Charts/ProposalsTable'
import BrowseMenu from '../components/Menus/BrowseMenu'

const proposalsTable = (props) => {
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

export default proposalsTable