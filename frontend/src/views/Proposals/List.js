import React, { useContext } from 'react'
import { StoreContext } from '../../contexts/StoreContext'
import { Grid } from '@material-ui/core'
import { Title } from '../../components/Typography'
import { ProposalsTable } from '../../components/Tables'
import { BrowseMenu } from '../../components/Menus'

export const ProposalsListPage = (props) => {
    const [store, ] = useContext(StoreContext)

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
            
            <ProposalsTable proposals={ store.proposals } paging={ true } />
        </div>
    )
}
