import React, { Fragment, useContext, useEffect, useState } from 'react'
import { makeStyles, useTheme } from '@material-ui/styles'
import { StoreContext } from '../../contexts/StoreContext'
import { Grid, List, ListItem, ListItemAvatar, Avatar, ListItemText, Card, CardHeader, CardContent } from '@material-ui/core'
import { FormControl, FormLabel, Select, MenuItem, OutlinedInput } from '@material-ui/core'
import {
    AccountBalance as InstitutionIcon,
    Assignment as TicIcon,
} from '@material-ui/icons'
import { Heading } from '../../components/Typography'
import StudyMetricsForm from '../../components/Forms/StudyMetrics/Metrics'
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

export const UtahRecommendationPage = props => {
    const [store, ] = useContext(StoreContext)
    const [study, setStudy] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const classes = useStyles()
    const theme = useTheme()
    
    useEffect(() => {
        if (store.proposals) {
            setStudy(store.proposals.find(proposal => proposal.proposalID === parseInt(props.match.params.proposalID)))
            setIsLoading(false)
        }
    }, [store.proposals])

    return (
        <div>

            <Heading>Utah Recommendation</Heading>
            
            {
                study ? (
                    <Fragment>
                        <Card>
                            <CardHeader
                                title={ study.longTitle }
                                subheader={ `${ study.shortTitle } (id: ${ study.proposalID })` }
                            />
                            <CardContent>
                                <List className={ classes.studyDetails }>
                                    <ListItem>
                                        <ListItemAvatar>
                                            <Avatar><InstitutionIcon /></Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary="Submitting Institution"
                                            secondary={ study.submitterInstitution || '-' }
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemAvatar>
                                            <Avatar><TicIcon /></Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary="Assigned TIC/RIC"
                                            secondary={ study.assignToInstitution || '-' }
                                        />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                        <Card>
                            <StudyMetricsForm proposalID={ study.proposalID } />
                        </Card>
                    </Fragment>
                ) : <CircularLoader />
            }
        </div>
    )
}
