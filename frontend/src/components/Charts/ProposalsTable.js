import React from 'react'
import { makeStyles } from '@material-ui/styles'
import MaterialTable from 'material-table'
import { Grid, Typography, List, Tooltip, ListItemIcon, ListItem, ListItemText } from '@material-ui/core'
import {
    AccountBox as PiIcon,
    CalendarToday as CalendarIcon,
    AccountBalance as InstitutionIcon,
    LocalOffer as TherapeuticAreaIcon,
    Assignment as TicIcon,
    Alarm as ProposalStatusIcon,
    AttachMoney as BudgetIcon,
} from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
    panel: {
        padding: `${ 2 * theme.spacing.unit }px ${ 4 * theme.spacing.unit }px`,
        backgroundColor: theme.palette.common.white,
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
    proposalId: { },
    column1: {
        borderRight: `1px solid ${ theme.palette.grey[300] }`,
    },
    column2: {
        borderRight: `1px solid ${ theme.palette.grey[300] }`,
    },
    column3: {},
    timelineRow: {
        borderTop: `1px solid ${ theme.palette.grey[300] }`,
    },
}))

const ProposalDetailPanel = props => {
    const {
        proposalID, shortTitle, piName, submitterInstitution, assignToInstitution, therapeuticArea, proposalStatus, totalBudget, fundingPeriod,
        dateSubmitted, meetingDate, fundingStart, plannedGrantSubmissionDate
    } = props
    const classes = useStyles()
    return (
        <Grid container className={ classes.panel }>
            <Grid item xs={ 12 } className={ classes.header }>
                <Typography variant="h5" className={ classes.title }>{ shortTitle }</Typography>
                <span className={ classes.proposalId }>#{ proposalID }</span>
            </Grid>
            <Grid item xs={ 4 } className={ classes.column1 }>
                <List dense>
                    <ListItem>
                        <Tooltip title="PI" aria-label="PI"><ListItemIcon><PiIcon /></ListItemIcon></Tooltip>
                        <ListItemText primary={ piName } />
                    </ListItem>
                    <ListItem>
                        <Tooltip title="Submitting Institution" aria-label="Submitting Institution"><ListItemIcon><InstitutionIcon /></ListItemIcon></Tooltip>
                        <ListItemText primary={ submitterInstitution } />
                    </ListItem>
                </List>
            </Grid>
            <Grid item xs={ 4 } className={ classes.column2 }>
                <List dense>
                    <ListItem>
                        <Tooltip title="Assigned TIC/RIC" aria-label="Assigned TIC/RIC"><ListItemIcon><TicIcon /></ListItemIcon></Tooltip>
                        <ListItemText primary={ assignToInstitution } />
                    </ListItem>
                    <ListItem>
                        <Tooltip title="Therapeutic Area" aria-label="Therapeutic Area"><ListItemIcon><TherapeuticAreaIcon /></ListItemIcon></Tooltip>
                        <ListItemText primary={ therapeuticArea } />
                    </ListItem>
                </List>
            </Grid>
            <Grid item xs={ 4 } className={ classes.column3 }>
                <List dense>
                    <ListItem>
                        <Tooltip title="Proposal Status" aria-label="Proposal Status"><ListItemIcon><ProposalStatusIcon /></ListItemIcon></Tooltip>
                        <ListItemText primary={ proposalStatus } />
                    </ListItem>
                    <ListItem>
                        <Tooltip title="Budget" aria-label="Budget"><ListItemIcon><BudgetIcon /></ListItemIcon></Tooltip>
                        <ListItemText primary={ totalBudget } />
                        <ListItemText primary={ fundingPeriod } />
                    </ListItem>
                </List>
            </Grid>
            <Grid item xs={ 12 } className={ classes.timelineRow }>
                <List dense>
                    <ListItem>
                        <Tooltip title="Submission and Approval Dates" aria-label="Submission and Approval Dates"><ListItemIcon><CalendarIcon /></ListItemIcon></Tooltip>
                        <ListItemText primary="Submission Date" secondary={ dateSubmitted }/>
                        <ListItemText primary="Approval Date" secondary={ meetingDate }/>
                        <ListItemText primary="Grant Submission Date" secondary={ fundingStart }/>
                        <ListItemText primary="Grant Award Date" secondary={ plannedGrantSubmissionDate }/>
                    </ListItem>
                </List>
            </Grid>
        </Grid>
    )
}

const ProposalsTable = (props) => {
    const { proposals } = props
    return (
        <MaterialTable
            components={{ }}
            columns={ [
                { title: 'Proposal Name', field: 'shortTitle', },
                { title: 'PI', field: 'piName', },
                { title: 'Status', field: 'proposalStatus', },
                { title: 'Therapeutic Area', field: 'therapeuticArea', },
                { title: 'Submitting Insitution', field: 'submitterInstitution', },
                { title: 'Assigned TIC/RIC', field: 'assignToInstitution', },
            ] }
            data={ proposals }
            options={{
                paging: props.paging,
                columnsButton: true,
                exportButton: true,
                filtering: true,
                grouping: true,
                pageSize: 15,
                pageSizeOptions: [15, 25, 50],
            }}
            title=""
            detailPanel={rowData => <ProposalDetailPanel { ...rowData } />}
            onRowClick={(event, rowData, togglePanel) => togglePanel()}
        />
    )
}

export default ProposalsTable