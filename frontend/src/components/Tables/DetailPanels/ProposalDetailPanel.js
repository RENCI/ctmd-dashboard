import React, { Fragment, useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Grid, List, Tooltip, ListItemIcon, ListItem, ListItemText, Divider } from '@material-ui/core'
import {
    AccountBox as PiIcon,
    CalendarToday as CalendarIcon,
    AccountBalance as InstitutionIcon,
    LocalOffer as TherapeuticAreaIcon,
    Assignment as TicIcon,
    Alarm as ProposalStatusIcon,
    AttachMoney as BudgetIcon,
    LocalLaundryService as ServicesIcon,
    CheckCircle as ApprovedIcon,
} from '@material-ui/icons'
import { DetailPanel } from './DetailPanel'

const useStyles = makeStyles(theme => ({
    actions: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    chip: {
        margin: theme.spacing(1),
        fontWeight: 'bold',
        float: 'right',
    },
    column1: { },
    column2: { },
    column3: { },
    servicesRow: {
        alignItems: 'flex-start'
    },
    service: {
        display: 'block',
    },
    timelineRow: {
        alignItems: 'flex-start',
    },
    date: {
        display: 'block',
    },
    dayCount: {
        display: 'block',
    },
}))

export const ProposalDetailPanel = props => {
    const {
        shortTitle, piName, submitterInstitution, assignToInstitution,
        therapeuticArea, proposalStatus, fundingAmount, fundingPeriod, fundingStatus, fundingStatusWhenApproved,
        dateSubmitted, meetingDate, fundingStart, plannedGrantSubmissionDate, actualGrantSubmissionDate,
        requestedServices, approvedServices,
    } = props
    const classes = useStyles()

    const todaysDate = (new Date()).toISOString().slice(0,10)
    
    const timeSpan = (startDate, endDate) => {
        return Math.round(new Date(endDate) - new Date(startDate))/(1000 * 60 * 60 * 24)
    }

    const timeSpanPhrase = (startDate, endDate) => {
        const span = timeSpan(startDate, endDate)
        return span > 0 ? `${ span } days ago` : `${ Math.abs(span) } days from now` 
    }

    return (
        <DetailPanel heading={ shortTitle } subheading="Proposal Details">
            <Grid container>
                <Grid item sm={ 12 } md={ 4 } className={ classes.column1 }>
                    <List dense>
                        <ListItem>
                            <Tooltip title="PI" aria-label="PI"><ListItemIcon><PiIcon /></ListItemIcon></Tooltip>
                            <ListItemText primary={ piName } />
                        </ListItem>
                        <ListItem>
                            <Tooltip title="Submitting Institution" aria-label="Submitting Institution"><ListItemIcon><InstitutionIcon /></ListItemIcon></Tooltip>
                            <ListItemText primary={ submitterInstitution } />
                        </ListItem>
                        <ListItem>
                            <Tooltip title="Assigned TIC/RIC" aria-label="Assigned TIC/RIC"><ListItemIcon><TicIcon /></ListItemIcon></Tooltip>
                            <ListItemText primary={ assignToInstitution } />
                        </ListItem>
                        <ListItem>
                            <Tooltip title="Therapeutic Area" aria-label="Therapeutic Area"><ListItemIcon><TherapeuticAreaIcon /></ListItemIcon></Tooltip>
                            <ListItemText primary={ therapeuticArea } />
                        </ListItem>
                        <ListItem>
                            <Tooltip title="Proposal Status" aria-label="Proposal Status"><ListItemIcon><ProposalStatusIcon /></ListItemIcon></Tooltip>
                            <ListItemText primary={ proposalStatus } />
                        </ListItem>
                    </List>
                </Grid>
                <Grid item sm={ 12 } md={ 4 } className={ classes.column2 }>
                    <List dense>
                        <ListItem>
                            <Tooltip title="Funding" aria-label="Funding"><ListItemIcon><BudgetIcon /></ListItemIcon></Tooltip>
                            <ListItemText primary={ fundingStatus } secondary={ `${ fundingPeriod } / ${ fundingAmount }` } />
                        </ListItem>
                        {
                            fundingStatusWhenApproved ? (
                                <ListItem>
                                    <Tooltip title="Funding" aria-label="Funding"><ListItemIcon><ApprovedIcon /></ListItemIcon></Tooltip>
                                    <ListItemText primary="Approval Funding Status" secondary={ fundingStatusWhenApproved } />
                                </ListItem>
                            ) : null
                        }
                    </List>
                </Grid>
                <Grid item sm={ 12 } md={ 4 }>
                    <List dense>
                        <ListItem className={ classes.servicesRow }>
                            <Tooltip title="Resources" aria-label="Requested and Approved Resources"><ListItemIcon><ServicesIcon /></ListItemIcon></Tooltip>
                            <ListItemText primary="Requested Resources" secondary={
                                <Fragment>
                                    {
                                        requestedServices.length > 0 ? requestedServices.map(
                                            service => <span className={ classes.service } key={ service }>{ service }</span>
                                        ) : 'N/A'
                                    }
                                </Fragment>
                            }/>
                            <ListItemText primary="Approved Resources" secondary={
                                <Fragment>
                                    {
                                        approvedServices.length > 0 ? approvedServices.map(
                                            service => <span className={ classes.service } key={ service }>{ service }</span>
                                        ) : 'N/A'
                                    }
                                </Fragment>
                            }/>
                        </ListItem>
                    </List>
                </Grid>

                <Grid item component={ Divider } xs={ 12 } style={{ padding: 0 }}/>

                <Grid item xs={ 12 }>
                    <List dense>
                        <ListItem className={ classes.timelineRow }>
                            <Tooltip title="Submission and Approval Dates" aria-label="Submission and Approval Dates"><ListItemIcon><CalendarIcon /></ListItemIcon></Tooltip>
                            <ListItemText primary="Submission Date" secondary={
                                dateSubmitted ? (
                                    <Fragment>
                                        <span className={ classes.date }>{ dateSubmitted }</span>
                                        <span className={ classes.dayCount }>Day 0</span>
                                        <span className={ classes.daysAgo }>{ timeSpanPhrase(dateSubmitted, todaysDate) }</span>
                                    </Fragment>
                                ) : <span className={ classes.date }>- - -</span>
                            }/>
                            <ListItemText primary="PAT Review Date" secondary={
                                meetingDate ? (
                                    <Fragment>
                                        <span className={ classes.date }>{ meetingDate }</span>
                                        <span className={ classes.dayCount }>Day { timeSpan(dateSubmitted, meetingDate) }</span>
                                        <span className={ classes.daysAgo }>{ timeSpanPhrase(meetingDate, todaysDate) }</span>
                                    </Fragment>
                                ) : <span className={ classes.date }>- - -</span>
                            }/>
                            <ListItemText primary="Planned Grant Submission Date" secondary={
                                plannedGrantSubmissionDate ? (
                                    <Fragment>
                                        <span className={ classes.date }>{ plannedGrantSubmissionDate }</span>
                                        <span className={ classes.dayCount }>Day { timeSpan(dateSubmitted, plannedGrantSubmissionDate) }</span>
                                        <span className={ classes.daysAgo }>{ timeSpanPhrase(plannedGrantSubmissionDate, todaysDate) }</span>
                                    </Fragment>
                                ) : <span className={ classes.date }>- - -</span>
                            }/>
                            <ListItemText primary="Actual Grant Submission Date" secondary={
                                plannedGrantSubmissionDate ? (
                                    <Fragment>
                                        <span className={ classes.date }>{ actualGrantSubmissionDate }</span>
                                        <span className={ classes.dayCount }>Day { timeSpan(dateSubmitted, actualGrantSubmissionDate) }</span>
                                        <span className={ classes.daysAgo }>{ timeSpanPhrase(actualGrantSubmissionDate, todaysDate) }</span>
                                    </Fragment>
                                ) : <span className={ classes.date }>- - -</span>
                            }/>
                            <ListItemText primary="Grant Award Date" secondary={
                                fundingStart ? (
                                    <Fragment>
                                        <span className={ classes.date }>{ fundingStart }</span>
                                        <span className={ classes.dayCount }>Day { timeSpan(dateSubmitted, fundingStart) }</span>
                                        <span className={ classes.daysAgo }>{ timeSpanPhrase(fundingStart, todaysDate) }</span>
                                    </Fragment>
                                ) : <span className={ classes.date }>- - -</span>
                            }/>
                        </ListItem>
                    </List>
                </Grid>
            </Grid>
        </DetailPanel>
    )
}
