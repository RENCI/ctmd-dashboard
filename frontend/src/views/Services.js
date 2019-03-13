import React, { useState, useEffect, useContext } from 'react'
import { StoreContext } from '../contexts/StoreContext'
import Heading from '../components/Typography/Heading'
import ProposalsTable from '../components/Charts/ProposalsTable'
import { CircularLoader } from '../components/Progress/Progress'
import BrowseMenu from '../components/Menus/BrowseMenu'
import { Grid, Card, CardContent, Button } from '@material-ui/core'

const ServicesPage = (props) => {
    const [store, setStore] = useContext(StoreContext)
    const [service, setService] = useState()
    const [displayedProposals, setDisplayedProposals] = useState()
    
    const grabProposals = event => {
        const service = event.currentTarget.value
        const proposals = store.proposals.filter(proposal => proposal.approvedServices.includes(service))
        setService(service)
        setDisplayedProposals(proposals)
    }
    
    return (
        <div>
            <Heading>Services</Heading>
            
            {
                store.services
                ? (
                    <Grid container spacing={ 16 }>
                        <Grid item xs={ 12 }>
                            <Card>
                                <CardContent>
                                    {
                                        store.services.map(service => (
                                            <Button variant="contained" value={ service } onClick={ grabProposals }>{ service }</Button>
                                        ))
                                    }
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={ 12 }>
                            <Card>
                                <CardContent>
                                    <b>Service: { displayedProposals ? service : null }</b><br/>
                                    <b>Count: { displayedProposals ? displayedProposals.length : 0 }</b>
                                    <pre>
                                        {
                                            displayedProposals
                                            ? JSON.stringify(displayedProposals, null, 2)
                                            : '[]'
                                        }
                                    </pre>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                ) : (
                    <CircularLoader/>
                )
            }
        </div>
    )
}

export default ServicesPage
