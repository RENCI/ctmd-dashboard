import React, { Fragment, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import api from '../../Api'
import { makeStyles } from '@material-ui/styles'
import { StoreContext } from '../../contexts/StoreContext'
import { Paper, Grid, Card, CardHeader, CardContent } from '@material-ui/core'
import {
    AccountBalance as InstitutionIcon,
    Assignment as TicIcon,
} from '@material-ui/icons'
import { Title } from '../../components/Typography'
import { CircularLoader } from '../../components/Progress/Progress'

const useStyles = makeStyles(theme => ({
    card: { },
    cardActions: {
        flex: '3 0 auto',
    },
    studyDetails: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        [theme.breakpoints.up('sm')]: {
            flexDirection: 'row',
        },
    },
}))

export const StudyProfilePage = props => {
    const [store, ] = useContext(StoreContext)
    const [study, setStudy] = useState(null)
    const [profile, setProfile] = useState(null)
    const classes = useStyles()
    
    useEffect(() => {
        const retrieveProfile = async (proposalID) => {
            await axios.get(api.studyProfile(proposalID))
                .then(response => {
                    setProfile(response.data['Study Profile'])
                })
                .catch(error => console.error(error))
        }
        if (store.proposals) {
            const thisProposal = store.proposals.find(proposal => proposal.proposalID === parseInt(props.match.params.proposalID))
            setStudy(thisProposal)
            retrieveProfile(thisProposal.proposalID)
        }
    }, [store.proposals])

    useEffect(() => {
    }, [study])

    return (
        <div>

            <Title>Study Profile</Title>
            
            {
                study && profile ? (
                    <Grid container spacing={ 4 }>
                        <Grid item xs={ 12 }>
                            <Card>
                                <CardHeader
                                    title={ study.longTitle }
                                    subheader={ `${ study.shortTitle } (id: ${ study.proposalID })` }
                                />
                                <CardContent>
                                    { profile && <pre>{ JSON.stringify(profile, null, 2) }</pre> }
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                ) : <CircularLoader />
            }
        </div>
    )
}
