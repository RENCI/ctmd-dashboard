import React, { Fragment, useContext } from 'react'
import { makeStyles } from '@material-ui/styles'
import MaterialTable from 'material-table'
import { Grid, Typography, List, Tooltip, ListItemIcon, ListItem, ListItemText, Chip } from '@material-ui/core'
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
import { SettingsContext } from '../../contexts/SettingsContext'

const useStyles = makeStyles(theme => ({
    panel: {
        padding: `${ 2 * theme.spacing.unit }px ${ 4 * theme.spacing.unit }px`,
        backgroundColor: theme.palette.extended.gingerBeer,
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2 * theme.spacing.unit,
        borderBottom: `1px solid ${ theme.palette.grey[300] }`,
    },
    title: {
        padding: `${ 2 * theme.spacing.unit }px 0`,
        color: theme.palette.secondary.main,
        fontWeight: 'bold',
        letterSpacing: '1px',
    },
    chip: {
        margin: theme.spacing.unit,
        fontWeight: 'bold',
    },
    column1: {
        borderRight: `1px solid ${ theme.palette.grey[300] }`,
    },
    column2: {
        borderRight: `1px solid ${ theme.palette.grey[300] }`,
    },
    column3: {},
    servicesRow: {
        alignItems: 'flex-start'
    },
    service: {
        display: 'block',
    },
    timelineRow: {
        alignItems: 'flex-start',
        borderTop: `1px solid ${ theme.palette.grey[300] }`,
    },
    date: {
        display: 'block',
    },
    dayCount: {
        display: 'block',
    },
}))

const ProposalDetailPanel = props => {
    const {
        proposalID, shortTitle, piName, submitterInstitution, assignToInstitution,
        therapeuticArea, proposalStatus, totalBudget, fundingPeriod, fundingStatus, fundingStatusWhenApproved,
        dateSubmitted, meetingDate, fundingStart, plannedGrantSubmissionDate,
        requestedServices, approvedServices,
    } = props
    const classes = useStyles()

    console.log(fundingStatusWhenApproved)
    
    const todaysDate = (new Date).toISOString().slice(0,10)

    const timeSpan = (startDate, endDate) => Math.round(new Date(endDate) - new Date(startDate))/(1000 * 60 * 60 * 24)

    return (
        <Grid container className={ classes.panel }>
            <Grid item xs={ 12 } className={ classes.header }>
                <Typography variant="h5" className={ classes.title }>{ shortTitle }</Typography>
                <Chip label={ `#${ proposalID }` } className={ classes.chip } color="secondary"/>
            </Grid>
            <Grid item xs={ 4 } className={ classes.column1 }>
                <List dense>
                    <ListItem>
                        <Tooltip title="PI" aria-label="PI"><ListItemIcon><PiIcon /></ListItemIcon></Tooltip>
                        <ListItemText primary={ piName || '-' } />
                    </ListItem>
                    <ListItem>
                        <Tooltip title="Submitting Institution" aria-label="Submitting Institution"><ListItemIcon><InstitutionIcon /></ListItemIcon></Tooltip>
                        <ListItemText primary={ submitterInstitution || '-' } />
                    </ListItem>
                    <ListItem>
                        <Tooltip title="Assigned TIC/RIC" aria-label="Assigned TIC/RIC"><ListItemIcon><TicIcon /></ListItemIcon></Tooltip>
                        <ListItemText primary={ assignToInstitution || '-' } />
                    </ListItem>
                    <ListItem>
                        <Tooltip title="Therapeutic Area" aria-label="Therapeutic Area"><ListItemIcon><TherapeuticAreaIcon /></ListItemIcon></Tooltip>
                        <ListItemText primary={ therapeuticArea || '-' } />
                    </ListItem>
                    <ListItem>
                        <Tooltip title="Proposal Status" aria-label="Proposal Status"><ListItemIcon><ProposalStatusIcon /></ListItemIcon></Tooltip>
                        <ListItemText primary={ proposalStatus || '-' } />
                    </ListItem>
                </List>
            </Grid>
            <Grid item xs={ 4 } className={ classes.column2 }>
                <List dense>
                    <ListItem>
                        <Tooltip title="Funding" aria-label="Funding"><ListItemIcon><BudgetIcon /></ListItemIcon></Tooltip>
                        <ListItemText primary={ fundingStatus || '-' } secondary={ `${ fundingPeriod || '-' } / ${ totalBudget || '-' }` } />
                    </ListItem>
                    {
                        fundingStatusWhenApproved ? (
                            <ListItem>
                                <Tooltip title="Funding" aria-label="Funding"><ListItemIcon><ApprovedIcon /></ListItemIcon></Tooltip>
                                <ListItemText primary="Approval Funding Status" secondary={ fundingStatusWhenApproved || '-' } />
                            </ListItem>

                        ) : null
                    }
                </List>
            </Grid>
            <Grid item xs={ 4 }>
                <List dense>
                    <ListItem className={ classes.servicesRow }>
                        <Tooltip title="Services" aria-label="Requested and Approved Services"><ListItemIcon><ServicesIcon /></ListItemIcon></Tooltip>
                        <ListItemText primary="Requested Services" secondary={
                            <Fragment>
                                {
                                    requestedServices.length > 0 ? requestedServices.map(
                                        service => <span className={ classes.service } key={ service }>{ service }</span>
                                    ) : 'N/A'
                                }
                            </Fragment>
                        }/>
                        <ListItemText primary="Approved Services" secondary={
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
            <Grid item xs={ 12 }>
                <List dense>
                    <ListItem className={ classes.timelineRow }>
                        <Tooltip title="Submission and Approval Dates" aria-label="Submission and Approval Dates"><ListItemIcon><CalendarIcon /></ListItemIcon></Tooltip>
                        <ListItemText primary="Submission Date" secondary={
                            dateSubmitted ? (
                                <Fragment>
                                    <span className={ classes.date }>{ dateSubmitted }</span>
                                    <span className={ classes.dayCount }>Day 0</span>
                                    <span className={ classes.daysAgo }>{ timeSpan(dateSubmitted, todaysDate) } days ago</span>
                                </Fragment>
                            ) : <span className={ classes.date }>- - -</span>
                        }/>
                        <ListItemText primary="PAT Review Date" secondary={
                            meetingDate ? (
                                <Fragment>
                                    <span className={ classes.date }>{ meetingDate }</span>
                                    <span className={ classes.dayCount }>Day { timeSpan(dateSubmitted, meetingDate) }</span>
                                    <span className={ classes.daysAgo }>{ timeSpan(meetingDate, todaysDate) } days ago</span>
                                </Fragment>
                            ) : <span className={ classes.date }>- - -</span>
                        }/>
                        <ListItemText primary="Grant Submission Date" secondary={
                            plannedGrantSubmissionDate ? (
                                <Fragment>
                                    <span className={ classes.date }>{ plannedGrantSubmissionDate }</span>
                                    <span className={ classes.dayCount }>Day { timeSpan(dateSubmitted, plannedGrantSubmissionDate) }</span>
                                    <span className={ classes.daysAgo }>{ timeSpan(plannedGrantSubmissionDate, todaysDate) } days ago</span>
                                </Fragment>
                            ) : <span className={ classes.date }>- - -</span>
                        }/>
                        <ListItemText primary="Grant Award Date" secondary={
                            fundingStart ? (
                                <Fragment>
                                    <span className={ classes.date }>{ fundingStart }</span>
                                    <span className={ classes.dayCount }>Day { timeSpan(dateSubmitted, fundingStart) }</span>
                                    <span className={ classes.daysAgo }>{ timeSpan(fundingStart, todaysDate) } days ago</span>
                                </Fragment>
                            ) : <span className={ classes.date }>- - -</span>
                        }/>
                    </ListItem>
                </List>
            </Grid>
        </Grid>
    )
}

const ProposalsTable = (props) => {
    const [settings] = useContext(SettingsContext)
    let { title, proposals } = props
    if (title) title += ` (${ proposals.length } Proposals)`
    return (
        <MaterialTable
            title={ title || '-' }
            components={{ }}
            columns={ [
                { title: 'ID', field: 'proposalID', hidden: false },
                { title: 'Proposal Name', field: 'shortTitle', hidden: !settings.visibleColumns.shortTitle },
                { title: 'PI', field: 'piName', hidden: !settings.visibleColumns.piName },
                { title: 'Status', field: 'proposalStatus', hidden: !settings.visibleColumns.proposalStatus },
                { title: 'Therapeutic Area', field: 'therapeuticArea', hidden: !settings.visibleColumns.therapeuticArea },
                { title: 'Submitting Insitution', field: 'submitterInstitution', hidden: !settings.visibleColumns.submitterInstitution },
                { title: 'Assigned TIC/RIC', field: 'assignToInstitution', hidden: !settings.visibleColumns.assignToInstitution  },
                { title: 'Submission Date', field: 'dateSubmitted', hidden: !settings.visibleColumns.dateSubmitted  },
                { title: 'PAT Review Date', field: 'meetingDate', hidden: !settings.visibleColumns.meetingDate  },
                { title: 'Grant Submission Date', field: 'plannedGrantSubmissionDate', hidden: !settings.visibleColumns.plannedGrantSubmissionDate  },
                { title: 'Grant Approval Date', field: 'fundingStart', hidden: !settings.visibleColumns.fundingStart  },
            ] }
            data={ proposals }
            options={{
                paging: props.paging,
                columnsButton: true,
                exportButton: true,
                filtering: true,
                grouping: true,
                pageSize: 15,
                pageSizeOptions: [15, 25, 50, 100, 200],
                exportFileName: title,
                detailPanelType: "single",
            }}
            detailPanel={rowData => <ProposalDetailPanel { ...rowData } />}
            onRowClick={(event, rowData, togglePanel) => togglePanel()}
        />
    )
}

export default ProposalsTable