import React, { useState, useContext, useEffect } from 'react'
import { useTheme } from '@material-ui/styles'
import { StoreContext } from '../../contexts/StoreContext'
import { Grid } from '@material-ui/core'
import { Heading } from '../../components/Typography/Typography'
import StudyCard from './StudyCard'

const StudiesPage = props => {
    const [store, ] = useContext(StoreContext)
    const [studies, setStudies] = useState()
    const [proposal, setProposal] = useState()
    const theme = useTheme()
    
    useEffect(() => {
        if (store.proposals) {
            const ids = [186, 171, 196]
            setStudies(store.proposals.filter(proposal => ids.includes(proposal.proposalID)))
        }
    }, [store.proposals])

    const handleSelectStudy = event => {
        setProposal(store.proposals.find(proposal => proposal.proposalID === event.currentTarget.value))
    }

    return (
        <div>
            <Heading>Site Report Cards</Heading>

            <Grid container spacing={ 2 * theme.spacing.unit }>
                {
                    studies ?
                    studies.map(study => {
                        return (
                            <Grid item xs={ 12 } md={ 6 } lg={ 4 } key={ study.proposalID }>
                                <StudyCard proposal={ study } />
                            </Grid>
                        )
                    })
                    : null
                }
            </Grid>

        </div>
    )
}

export default StudiesPage