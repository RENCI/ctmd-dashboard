import React, { useContext, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import MaterialTable from 'material-table'
import { SettingsContext, StoreContext } from '../../contexts'
import { IconButton } from '@material-ui/core'
import { Assessment as ReportIcon } from '@material-ui/icons'

export const StudiesTable = ({ title, studies, paging }) => {
    const [store, ] = useContext(StoreContext)
    const [settings] = useContext(SettingsContext)
    if (title) title += ` (${ studies.length } Studies)`
    
    const getSitesForStudy = proposalID => {
        return store.sites.filter(site => site.proposalID == proposalID)
    }

    useEffect(() => {
        const populateSites = () => {
            studies.forEach(study => {
                study.sites = getSitesForStudy(study.proposalID)
            })
        }
        populateSites()
    }, [])
    
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
                actionsColumnIndex: -1,
            }}
            actions={[ {} ]}
            components={{
                Action: ({ data }) => (
                    <IconButton aria-label="View Detailed Report" size="large" color="secondary"
                        component={ NavLink } to={ `/studies/${ data.proposalID }` }
                    >
                        <ReportIcon style={{ fontSize: 24 }} />
                    </IconButton>
                ),
            }}
        />
    )
}
