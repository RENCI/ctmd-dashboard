import React, { useState, useContext } from 'react'
import { makeStyles, useTheme } from '@material-ui/styles'
import { StoreContext } from '../contexts/StoreContext'
import { Grid, List, ListItem, Avatar, ListItemText, Card, CardHeader, CardContent } from '@material-ui/core'
import { FormControl, FormLabel, Select, MenuItem, OutlinedInput } from '@material-ui/core'
import {
    AccountBalance as InstitutionIcon,
    Assignment as TicIcon,
} from '@material-ui/icons'
import { Heading } from '../components/Typography/Typography'
import StudyMetricsForm from '../components/Forms/StudyMetrics/Metrics'

const useStyles = makeStyles(theme => ({
    card: { },
    cardActions: {
        flex: '3 0 auto',
    },
    details: {
        width: '100%',
    },
}))

const StudyMetricsPage = props => {
    const [store, ] = useContext(StoreContext)
    const [currentProposal, setCurrentProposal] = useState(null)
    const classes = useStyles()
    const theme = useTheme()

    const handleChangeCurrentProposal = event => {
        setCurrentProposal(store.proposals.find(proposal => proposal.proposalID === event.target.value))
    }

    return (
        <div>

            <Heading>Study Metrics</Heading>
            
            <Grid container spacing={ 2 * theme.spacing.unit }>
                <Grid item xs={ 12 }>
                    <Card classes={{ root: classes.card }}>
                        <CardHeader title="Proposal Details" classes={{ action: classes.cardActions }} action={
                            store.proposals
                            ? (
                                <FormControl fullWidth variant="outlined">
                                    <FormLabel>Select Proposal</FormLabel>
                                    <Select
                                        value={ currentProposal ? currentProposal.proposalID : -1 }
                                        onChange={ handleChangeCurrentProposal }
                                        input={ <OutlinedInput fullWidth labelWidth={ 0 } name="network" id="network" style={{ marginTop: '16px' }}/> }
                                    >
                                        <MenuItem value="-1">-</MenuItem>
                                        {
                                            store.proposals
                                                .filter(proposal => proposal.proposalStatus === 'Ready for Implementation')
                                                .map(proposal => <MenuItem key={ proposal.proposalID } value={ proposal.proposalID }>{ proposal.shortTitle } (id: { proposal.proposalID })</MenuItem>)
                                        }
                                    </Select>
                                </FormControl>
                            ) : '...'
                        }/>
                        <CardContent>
                            <CardHeader
                                subheader={ currentProposal ? (
                                    <div>
                                        <div>{ currentProposal.longTitle } </div>
                                        <div style={{ opacity: 0.5 }}>
                                            { `${ currentProposal.shortTitle } (id: ${ currentProposal.proposalID })` }
                                        </div>
                                    </div>
                                ) : null }
                            />
                            <List className={ classes.details } style={{ opacity: currentProposal ? 1 : 0.25 }}>
                                <ListItem>
                                    <Avatar><InstitutionIcon /></Avatar>
                                    <ListItemText
                                        primary="Submitting Institution"
                                        secondary={ currentProposal ? (currentProposal.submitterInstitution || '-') : '-' }
                                    />
                                </ListItem>
                                <ListItem>
                                    <Avatar><TicIcon /></Avatar>
                                    <ListItemText
                                        primary="Assigned TIC/RIC"
                                        secondary={ currentProposal ? (currentProposal.assignToInstitution || '-') : '-' }
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={ 12 }>
                    {
                        currentProposal
                        ? (
                            <Card>
                                 <StudyMetricsForm proposalID={ currentProposal.proposalID } />
                            </Card>
                        ) : null
                    }
                </Grid>
            </Grid>
            
        </div>
    )
}

export default StudyMetricsPage