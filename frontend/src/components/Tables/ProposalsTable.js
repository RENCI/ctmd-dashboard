import React, { useContext } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Redirect } from 'react-router-dom'
import MaterialTable from 'material-table'
import { Grid } from '@material-ui/core'
import {
    Description as ProposalIcon,
    DescriptionOutlined as ProposalOpenIcon,
    Assessment as ReportIcon,
    AssessmentOutlined as ReportOpenIcon,
} from '@material-ui/icons'
import { SettingsContext, StoreContext } from '../../contexts'
import { formatDate } from '../../utils'
import { isSiteActive } from '../../utils/sites'
import { Subheading, Subsubheading, Paragraph, Caption } from '../../components/Typography'
import { CircularLoader } from '../../components/Progress/Progress'
import { SitesActivationPieChart } from '../../components/Charts'
import { ProposalDetailPanel, StudyDetailPanel } from './DetailPanels'

const useTableStyles = makeStyles(theme => ({
    panelIcon: {
        padding: 0,
    },    
}))

export const ProposalsTable = (props) => {
    const [settings] = useContext(SettingsContext)
    const classes = useTableStyles()
    let { title, proposals } = props
    if (title) title += ` (${ proposals.length } Proposals)`

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
            data={ proposals }
            options={{
                paging: props.paging,
                columnsButton: true,
                exportButton: true,
                filtering: true,
                grouping: true,
                pageSize: settings.tables.pageSize,
                pageSizeOptions: [15, 25, 50, 100, 200],
                exportFileName: title,
            }}
            detailPanel={ rowData => <ProposalDetailPanel { ...rowData } />}
            onRowClick={ (event, rowData, togglePanel) => togglePanel() }
        />
    )
}
