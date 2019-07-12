import React, { useState } from 'react'
import api from '../Api'
import { Heading } from '../components/Typography'
import { Grid } from '@material-ui/core'
import ProposalsNetwork from '../components/Visualizations/ProposalsNetworkContainer'
import { ProposalsTable } from '../components/Tables'

export const CollaborationsPage = (props) => {
    const [proposals, setProposals] = useState()

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

              <Grid item xs={ 12 }>
                <ProposalsTable proposals={ proposals } paging={ false } />
              </Grid>

            </Grid>
        </div>
    )
}
