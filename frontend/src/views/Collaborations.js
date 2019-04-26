import React, { useState, useContext } from 'react'
import { ApiContext } from '../contexts/ApiContext'
import { Heading } from '../components/Typography/Typography'
import { Grid } from '@material-ui/core'
import ProposalsNetwork from '../components/Visualizations/ProposalsNetworkContainer'
import ProposalsTable from '../components/Charts/ProposalsTable'

const collaborationsPage = (props) => {
    const [proposals, setProposals] = useState()
    const api = useContext(ApiContext)

    const handleSelectProposals = proposals => {
        setProposals(proposals)
    }

    return (
        <div>
            <Heading>Collaborations</Heading>

            <Grid container>

              <Grid item xs={ 12 }>
                <ProposalsNetwork apiUrl={ api.proposals } onSelectProposals={ handleSelectProposals }/>
              </Grid>

              <Grid>
                <ProposalsTable proposals={ proposals } paging={ false } />
              </Grid>

            </Grid>
        </div>
    )
}

export default collaborationsPage
