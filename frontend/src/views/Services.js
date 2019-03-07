import React, { useState, useEffect, useContext } from 'react'
import { StoreContext } from '../contexts/StoreContext'
import Heading from '../components/Typography/Heading'
import ProposalsTable from '../components/Charts/ProposalsTable'
import { CircularLoader } from '../components/Progress/Progress'
import BrowseMenu from '../components/Menus/BrowseMenu'
import { Button } from '@material-ui/core'

const ServicesPage = (props) => {
    const [store, setStore] = useContext(StoreContext)
    const [displayedProposals, setDisplayedProposals] = useState()
    
    const grabProposals = event => {
        const service = event.currentTarget.value
        const proposals = store.proposals.filter(proposal => proposal.approvedServices.includes(service))
        setDisplayedProposals(proposals)
    }
    
    return (
        <div>
            <Heading>Services</Heading>

            {
                store.services
                ? (
                    <div>
                        {
                            store.services.map(service => (
                                <Button variant="contained" value={ service } onClick={ grabProposals }>{ service }</Button>
                            ))
                        }
                        <div>
                            <pre>
                                {
                                    displayedProposals
                                    ? JSON.stringify(displayedProposals, null, 2)
                                    : '[]'
                                }
                            </pre>
                        </div>
                    </div>
                ) : (
                    <CircularLoader/>
                )
            }
        </div>
    )
}

export default ServicesPage
