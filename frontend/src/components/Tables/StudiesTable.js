import React, { Fragment, useState, useContext, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { makeStyles } from '@material-ui/styles'
import MaterialTable from 'material-table'
import { IconButton } from '@material-ui/core'
import { Collapse } from '@material-ui/core'
import { BarChart as ReportIcon } from '@material-ui/icons'
import { UtahIcon } from '../Icons/Utah'
import { SettingsContext } from '../../contexts/SettingsContext'
import { Subheading, Paragraph } from '../../components/Typography/Typography'

const useDetailPanelStyles = makeStyles(theme => ({
    detailPanel: {
        backgroundColor: theme.palette.extended.hatteras,
        padding: theme.spacing(2)
    },
    actions: {
        textAlign: 'right',
    },
}))

const StudyReport = props => {
    const {
        proposalID, shortTitle, piName, submitterInstitution, assignToInstitution,
        therapeuticArea, proposalStatus, fundingAmount, fundingPeriod, fundingStatus, fundingStatusWhenApproved,
        dateSubmitted, meetingDate, fundingStart, plannedGrantSubmissionDate, actualGrantSubmissionDate,
        requestedServices, approvedServices,
    } = props
    const classes = useDetailPanelStyles()

    return (
        <section className={ classes.detailPanel }>
            <Subheading>{ shortTitle } Report</Subheading>
            <Paragraph>
                Brief summary on sites <br/>
                How many / How many active <br/>
                Enrollment numbers / Activation dates <br/>
                Enrollment Numbers and milestones overview
            </Paragraph>
            <div className={ classes.actions }>
                <IconButton aria-label="View Utah Recommendation" size="large"
                    component={ NavLink } to={ `/studies/${ proposalID }/utah` }
                >
                    <UtahIcon />
                </IconButton>
                <IconButton aria-label="View Detailed Report" size="large"
                    component={ NavLink } to={ `/studies/${ proposalID }/report` }
                >
                    <ReportIcon />
                </IconButton>
        </div>
        </section>
    )
}

const StudiesTable = ({ title, studies, paging }) => {
    const [settings] = useContext(SettingsContext)
    if (title) title += ` (${ studies.length } Studies)`

    return (
        <MaterialTable
            title={ title || '-' }
            components={{ }}
            columns={ [
                {
                    title: 'ID', field: 'proposalID',
                    hidden: !settings.tables.visibleColumns.proposalID,
                },
                {
                    title: 'Proposal Name', field: 'shortTitle',
                    hidden: !settings.tables.visibleColumns.shortTitle,
                },
                {
                    title: 'PI', field: 'piName',
                    hidden: !settings.tables.visibleColumns.piName,
                },
                {
                    title: 'Status', field: 'proposalStatus',
                    hidden: !settings.tables.visibleColumns.proposalStatus,
                },
                {
                    title: 'Therapeutic Area', field: 'therapeuticArea',
                    hidden: !settings.tables.visibleColumns.therapeuticArea,
                },
                {
                    title: 'Submitting Insitution', field: 'submitterInstitution',
                    hidden: !settings.tables.visibleColumns.submitterInstitution,
                },
                {
                    title: 'Assigned TIC/RIC', field: 'assignToInstitution',
                    hidden: !settings.tables.visibleColumns.assignToInstitution,
                },
                {
                    title: 'Submission Date', field: 'dateSubmitted',
                    hidden: !settings.tables.visibleColumns.dateSubmitted, 
                },
                {
                    title: 'PAT Review Date', field: 'meetingDate',
                    hidden: !settings.tables.visibleColumns.meetingDate,
                },
                {
                    title: 'Planned Grant Submission Date', field: 'plannedGrantSubmissionDate',
                    hidden: !settings.tables.visibleColumns.plannedGrantSubmissionDate,
                },
                {
                    title: 'Actual Grant Submission Date', field: 'actualGrantSubmissionDate',
                    hidden: !settings.tables.visibleColumns.actualGrantSubmissionDate,
                },
                {
                    title: 'Grant Award Date', field: 'fundingStart',
                    hidden: !settings.tables.visibleColumns.fundingStart,
                },
                {
                    title: 'Funding Amount', field: 'fundingAmount',
                    hidden: !settings.tables.visibleColumns.fundingAmount,
                },
                {
                    title: 'Funding Period', field: 'fundingPeriod',
                    hidden: !settings.tables.visibleColumns.fundingPeriod,
                },
            ] }
            data={ studies }
            options={{
                paging: paging,
                columnsButton: true,
                exportButton: true,
                filtering: true,
                grouping: true,
                pageSize: settings.tables.pageSize,
                pageSizeOptions: [15, 25, 50, 100, 200],
                exportFileName: title,
                detailPanelType: 'multiple',
            }}
            detailPanel={[
                {
                    tooltip: 'View Report',
                    render: rowData => <StudyReport { ...rowData } />,
                },
            ]}
            onRowClick={ (event, rowData, togglePanel) => togglePanel() }
        />
    )
}

export default StudiesTable