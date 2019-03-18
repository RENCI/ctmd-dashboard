import React, { useState, useContext, useEffect } from 'react'
import { makeStyles, useTheme } from '@material-ui/styles'
import axios from 'axios'
import { StoreContext } from '../contexts/StoreContext'
import { ApiContext } from '../contexts/ApiContext'
import { Grid, Card, CardHeader, CardActions, CardContent, Button } from '@material-ui/core'
import { FormControl, TextField, InputLabel, Select, MenuItem, OutlinedInput, FormHelperText } from '@material-ui/core'
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, ExpansionPanelActions, Divider } from '@material-ui/core'
import { KeyboardArrowLeft as LeftIcon, KeyboardArrowRight as RightIcon, ExpandMore as ExpandIcon } from '@material-ui/icons'
import Heading from '../components/Typography/Heading'
import Subheading from '../components/Typography/Subheading'
import { CircularLoader } from '../components/Progress/Progress'
import ProposalDetailsForm from '../components/Forms/ProposalDetails'
import StudyMetricsForm from '../components/Forms/StudyMetrics/Metrics'

const useStyles = makeStyles(theme => ({
    root: {
        // ...theme.mixins.debug,
    },
    navigation: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    flexer: {
        flex: 1,
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    previousNextName: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'inline-block',
        }
    },
}))

const StudyMetricsPage = props => {
    const [store, setStore] = useContext(StoreContext)
    const [current, setCurrent] = useState(0)
    const api = useContext(ApiContext)
    const classes = useStyles()
    const theme = useTheme()

    const handleNavigate = value => event => {
        setCurrent((current + value + store.proposals.length) % store.proposals.length)
    }

    const handleChangeCurrent = event => {
        setCurrent(event.target.value)
    }

    return (
        <div className={ classes.root }>

            <Heading>Study Metrics</Heading>
            
            <Grid container spacing={ 2 * theme.spacing.unit }>
                 <Grid item xs={ 12 }>
                    {
                        store.proposals
                        ? (
                            <Card>
                                <CardHeader subheader="Proposal Details"/>
                                <CardContent>
                                    <FormControl fullWidth variant="outlined" className={ classes.formControl }>
                                        <InputLabel htmlFor="proposal-short-title">Proposal Short Title
                                        </InputLabel>
                                        <Select value={ current } onChange={ handleChangeCurrent }
                                            input={ <OutlinedInput labelWidth={ 116 } name="proposal-short-title" id="proposal-short-title" /> }
                                        >
                                            {
                                                store.proposals.map(
                                                    (proposal, i) => <MenuItem key={ proposal.proposalID } value={ i }>{ proposal.shortTitle } - #{ proposal.proposalID }</MenuItem>
                                                )
                                            }
                                        </Select>
                                    </FormControl>
                                    <FormControl variant="outlined" fullWidth>
                                        <TextField disabled id="proposal-full-name" label="Full Name" margin="normal" variant="outlined" value="add this to proposals query" />
                                    </FormControl>
                                    <FormControl variant="outlined" fullWidth>
                                        <TextField disabled id="tic" label="Assigned TIC/RIC" margin="normal" variant="outlined" value={ store.proposals[current].assignToInstitution || '' } />
                                    </FormControl>
                                    <FormControl variant="outlined" fullWidth>
                                        <TextField disabled id="submitting-institution" label="Submitting Institution" margin="normal" variant="outlined" value={ store.proposals[current].submitterInstitution || '' } />
                                    </FormControl>
                                </CardContent>
                            </Card>
                        ) : <CircularLoader />
                    }
                </Grid>

                <Grid item xs={ 12 }>
                    {
                        store.proposals && current >= 0
                        ? (
                            <Card>
                                 <StudyMetricsForm proposalID={ store.proposals[current].proposalID } />
                            </Card>
                        ) : <CircularLoader />
                    }
                </Grid>
            </Grid>
            
        </div>
    )
}

export default StudyMetricsPage