import React from 'react'
import { Grid } from '@material-ui/core'
import { Title } from '../../components/Typography'
import { ProposalsTable } from '../../components/Tables'
import { BrowseMenu } from '../../components/Menus'
import { useProposals } from '../../hooks'

export const ProposalsListPage = (props) => {
    const proposals = useProposals()

    return (
        <div>
            <Title>
                <Grid container>
                    <Grid item style={{ flex: 1 }}>
                        Proposals
                    </Grid>
                    <Grid item>
                        <BrowseMenu />
                    </Grid>
                </Grid>
            </Title>

            <ProposalsTable proposals={ proposals } paging={ true } />
        </div>
    )
}
