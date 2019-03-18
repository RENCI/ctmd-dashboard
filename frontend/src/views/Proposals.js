import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { ApiContext } from '../contexts/ApiContext'
import { StoreContext } from '../contexts/StoreContext'
import Heading from '../components/Typography/Heading'
import ProposalsTable from '../components/Charts/ProposalsTable'
import { CircularLoader } from '../components/Progress/Progress'
import BrowseMenu from '../components/Menus/BrowseMenu'

const proposalsTable = (props) => {
    const [store, setStore] = useContext(StoreContext)
    // const api = useContext(ApiContext)

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