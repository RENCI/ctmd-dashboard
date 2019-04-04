import React, { useState, useContext } from 'react'
import { makeStyles, useTheme } from '@material-ui/styles'
import { StoreContext } from '../contexts/StoreContext'
import { Grid, List, ListItem, Avatar, ListItemText, Card, CardHeader, CardContent } from '@material-ui/core'
import { FormControl, FormLabel, Select, MenuItem, OutlinedInput } from '@material-ui/core'
import {
    AccountBalance as InstitutionIcon,
    Assignment as TicIcon,
} from '@material-ui/icons'
import Heading from '../components/Typography/Heading'
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
    const [current, setCurrent] = useState(-1)
    const classes = useStyles()
    const theme = useTheme()

    const handleChangeCurrent = event => {
        setCurrent(event.target.value)
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
                                        value={ current }
                                        onChange={ handleChangeCurrent }
                                        input={ <OutlinedInput fullWidth labelWidth={ 0 } name="network" id="network" style={{ marginTop: '16px' }}/> }
                                    >
                                        <MenuItem value="-1">-</MenuItem>
                                        {
                                            store.proposals
                                                .filter(proposal => proposal.proposalStatus === 'Ready for Implementation')
                                                .map((proposal, i) => <MenuItem key={ proposal.proposalID } value={ i }>{ proposal.shortTitle } (id: { proposal.proposalID })</MenuItem>)
                                        }
                                    </Select>
                                </FormControl>
                            ) : '...'
                        }/>
                        <CardContent>
                            <CardHeader
                                subheader={ current >= 0 ? (
                                    <div>
                                        <div>{ current >= 0 ? store.proposals[current].longTitle : null } </div>
                                        <div style={{ opacity: 0.5 }}>
                                            { `${ store.proposals[current].shortTitle } (id: ${ store.proposals[current].proposalID })` }
                                        </div>
                                    </div>
                                ) : null }
                            />
                            <List className={ classes.details } style={{ opacity: current >= 0 ? 1 : 0.25 }}>
                                <ListItem>
                                    <Avatar><InstitutionIcon /></Avatar>
                                    <ListItemText primary="Submitting Institution" secondary={
                                        current >= 0 ? store.proposals[current].submitterInstitution || '-' : '...'} />
                                </ListItem>
                                <ListItem>
                                    <Avatar><TicIcon /></Avatar>
                                    <ListItemText primary="Assigned TIC/RIC" secondary={
                                        current >= 0 ? store.proposals[current].assignToInstitution || '-' : '...'} />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={ 12 }>
                    {
                        store.proposals && current >= 0
                        ? (
                            <Card>
                                 <StudyMetricsForm proposalID={ store.proposals[current].proposalID } />
                            </Card>
                        ) : null
                    }
                </Grid>
            </Grid>
            
        </div>
    )
}

export default StudyMetricsPage