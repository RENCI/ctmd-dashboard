import React from 'react'
import classnames from 'classnames'
import { makeStyles } from '@material-ui/styles'
import MaterialTable from 'material-table'
import { Grid, List, ListItemIcon, ListItem, ListItemText } from '@material-ui/core'
import Subheading from '../Typography/Subheading'
import {
    AccountBox as PiIcon,
    CalendarToday as CalendarIcon,
    AccountBalance as InstitutionIcon,
    LocalOffer as TherapeuticAreaIcon,
    Assignment as TicIcon,
    Alarm as ProposalStatusIcon,
    AttachMoney as BudgetIcon,
    Timelapse as FundingDurationIcon,
} from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
    panel: {
        // ...theme.mixins.debug,
        padding: `${ 2 * theme.spacing.unit }px ${ 4 * theme.spacing.unit }px`,
        backgroundColor: theme.palette.common.white,
    },
    panelHeader: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 2 * theme.spacing.unit,
        marginBottom: 2 * theme.spacing.unit,
        borderBottom: `1px solid ${ theme.palette.grey[300] }`,
    },
    panelVisualizationColumn: {
        borderLeft: `1px solid ${ theme.palette.grey[300] }`,
        padding: 2 * theme.spacing.unit,
    },
}))

const ProposalDetailPanel = props => {
    const { proposal_id, short_name, pi_name, org_name, tic_name, submission_date, therapeutic_area, proposal_status, anticipated_budget, funding_duration } = props
    const classes = useStyles()
    return (
        <Grid container className={ classes.panel }>
            <Grid item xs={ 12 } className={ classes.panelHeader }>
                <Subheading>{ short_name }</Subheading>
                <span>#{ proposal_id }</span>
            </Grid>
            <Grid item xs={ 2 }>
                <List dense>
                    <ListItem>
                        <ListItemIcon><PiIcon /></ListItemIcon>
                        <ListItemText primary={ pi_name } />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><CalendarIcon /></ListItemIcon>
                        <ListItemText primary={ submission_date } />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><TherapeuticAreaIcon /></ListItemIcon>
                        <ListItemText primary={ therapeutic_area } />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><InstitutionIcon /></ListItemIcon>
                        <ListItemText primary={ org_name } />
                    </ListItem>
                </List>
            </Grid>
            <Grid item xs={ 2 }>
                <List dense>
                    <ListItem>
                        <ListItemIcon><TicIcon /></ListItemIcon>
                        <ListItemText primary={ tic_name } />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><ProposalStatusIcon /></ListItemIcon>
                        <ListItemText primary={ proposal_status } />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><BudgetIcon /></ListItemIcon>
                        <ListItemText primary={ anticipated_budget } />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><FundingDurationIcon /></ListItemIcon>
                        <ListItemText primary={ funding_duration } />
                    </ListItem>
                </List>
            </Grid>
            <Grid item xs={ 6 } className={ classes.panelVisualizationColumn }>
                <div>
                    Some visualization. Perhaps days elapsed between submission, approval, etc.
                </div>
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
                { title: 'Proposal Name', field: 'short_name', },
                { title: 'PI', field: 'pi_name', },
                { title: 'Proposal Status', field: 'proposal_status', },
                { title: 'Therapeutic Area', field: 'therapeutic_area', },
                { title: 'TIC', field: 'tic_name', },
                { title: 'Organization', field: 'org_name', },
                { title: 'Submission Date', field: 'prop_submit', type: 'datetime', render: ({submission_date}) => <span>{ submission_date }</span>},
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