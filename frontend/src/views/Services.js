import React, { useState, useEffect, useContext } from 'react'
import { StoreContext } from '../contexts/StoreContext'
import Heading from '../components/Typography/Heading'
import ProposalsTable from '../components/Charts/ProposalsTable'
import { CircularLoader } from '../components/Progress/Progress'
import BrowseMenu from '../components/Menus/BrowseMenu'

const ServicesPage = (props) => {
    const [store, setStore] = useContext(StoreContext)

    return (
        <div>
            <Heading>Services</Heading>

            {
                store.services
                ? (
                    <div>
                        <ul>
                            { store.services.map(service => <li>{ service }</li>) }
                        </ul>
                    </div>
                ) : (
                    <CircularLoader/>
                )
            }
        </div>
    )
}

export default ServicesPage
