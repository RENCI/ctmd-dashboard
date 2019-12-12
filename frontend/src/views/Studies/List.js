import React, { useContext, useEffect, useState } from 'react'
import { StoreContext } from '../../contexts/StoreContext'
import { Title } from '../../components/Typography'
import { StudiesTable } from '../../components/Tables'
import { Grid } from '@material-ui/core'
import api from '../../Api'
import { DropZone } from '../../components/Forms/DropZone'

export const StudiesListPage = props => {
    const [store, ] = useContext(StoreContext)
    const [studies, setStudies] = useState([])

    useEffect(() => {
        if (store.proposals) {
            const proposalsWithProfiles = store.proposals.filter(proposal => proposal.profile && true)
            setStudies(proposalsWithProfiles)
        }
    }, [store.proposals])

    return (
        <div>

            <Grid container>
                <Grid item xs={ 11 } md={ 7 }>
                    <Title>Studies</Title>
                </Grid>
                <Grid item xs={ 11 } md={ 5 }>
                    <DropZone endpoint={ `${ api.uploadStudyProfile }/column/ProposalID` } />
                </Grid>
            </Grid>
            
            <StudiesTable studies={ studies } paging={ true } />
            
        </div>
    )
}
