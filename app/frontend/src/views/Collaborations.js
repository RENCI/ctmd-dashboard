import React, { useState } from 'react'
import api from '../Api'
import { Title, Subtitle } from '../components/Typography'
import { Grid } from '@material-ui/core'
import ProposalsNetwork from '../components/Visualizations/ProposalsNetworkContainer'
import { ProposalsTable } from '../components/Tables'

export const CollaborationsPage = () => {
    const [proposals, setProposals] = useState()

    const handleSelectProposals = proposals => {      
        // XXX: Hack to get around react warning
        setTimeout(() => setProposals(proposals), 0)
    }

    return (
        <div>
            <Title>Collaborations</Title>
            <Subtitle>Explore proposal categories and relationships between those categories</Subtitle>

            <Grid container>
              <Grid item xs={ 12 }>
                  <ProposalsNetwork apiUrl={ api.proposals } onSelectProposals={ handleSelectProposals }/>
              </Grid>

              <Grid item xs={ 12 }>
                  <ProposalsTable proposals={ proposals } paging={ false } />
              </Grid>
            </Grid>
        </div>
    )
}
