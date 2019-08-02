import React, { Fragment, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import api from '../../Api'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/styles'
import { StoreContext } from '../../contexts/StoreContext'
import {
    Grid, Card, CardHeader, CardContent, Button,
} from '@material-ui/core'
import {
    AccountBalance as InstitutionIcon,
    Assignment as TicIcon,
    Assessment as ReportIcon,
    CloudUpload as DropZoneIcon,
} from '@material-ui/icons'
import { Title } from '../../components/Typography'
import { CircularLoader } from '../../components/Progress/Progress'
import { DropZone } from '../../components/Forms'

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
    
    return (
        <div>

            <Title>Study Profile</Title>
            
            <Grid container spacing={ 4 }>
                <Grid item xs={ 12 }>
                    <Card>
                        {
                            study && profile ? (
                                <Fragment>
                                    <CardHeader
                                        title={ study.longTitle }
                                        subheader={ `${ study.shortTitle } (id: ${ study.proposalID })` }
                                        action={
                                            <Button aria-label="View Report" component={ Link } to={ `/studies/${ study.proposalID }/report` }>
                                                <ReportIcon />
                                            </Button>
                                        }
                                    />
                                    <CardContent>
                                        { profile && <pre>{ JSON.stringify(profile, null, 2) }</pre> }
                                    </CardContent>
                                </Fragment>
                            ) : <CircularLoader />
                        }
                    </Card>
                </Grid>
                <Grid item xs={ 12 }>
                    <Card>
                        <CardHeader
                            title="Upload Study Profile"
                            subheader="Note that this will replace existing study data"
                        />
                        <CardContent>
                            <DropZone proposalID={ study.proposalID }/>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    )
}
