import React, { useContext, useEffect, useState } from 'react'
import MaterialTable from 'material-table'
import { SettingsContext } from '../../contexts'
import { ProposalDetailPanel } from './DetailPanels'
import { Check as CheckIcon } from '@material-ui/icons'
import { Tooltip, TableCell } from '@material-ui/core'
import CustomTableGroupRow from './custom-group-row'

const resources = [
    'EHR-Based Cohort Assessment',
    'Community Engagement Studio',
    'Recruitment & Retention Planning',
    'Recruitment Feasibility Assessment',
    'Recruitment Materials',
    'Single IRB',
    'Standard Agreements',
    'Other',
]

const headerWithTooltip = (title, tooltip) => (
    <Tooltip title={tooltip} placement='top'>
        <TableCell className="MTableHeader-header-350">{title}</TableCell>
    </Tooltip>
)


export const ProposalsTable = ({ title, proposals, components, ...props }) => {
    const [settings] = useContext(SettingsContext)

    useEffect(() => {
        if (proposals) {
            // Add property for each resource to each proposal, identify as requested, approved, or neither
            proposals.forEach(proposal => {
                resources.forEach(resource => {
                    proposal[resource] = proposal.approvedServices.includes(resource) ? 'Approved' : (proposal.requestedServices.includes(resource) ? 'Requested' : '')
                })
            })
        }

    }, [proposals])

    if (title) title += ` (${ proposals.length } Proposals)`
    
    return (
        <MaterialTable
            title={ title || null }
            components={{ ...components }}
            columns={ [
                {
                    title: headerWithTooltip('ID', 'Proposal ID'),
                    field: 'proposalID',
                    hidden: !settings.tables.visibleColumns.proposalID,
                },
                {
                    title: headerWithTooltip('Proposal Name', 'Proposal Name'),
                    field: 'shortTitle',
                    hidden: !settings.tables.visibleColumns.shortTitle,
                },
                {
                    title: headerWithTooltip('PI', 'Principal Investigator'),
                    field: 'piName',
                    hidden: !settings.tables.visibleColumns.piName,
                },
                {
                    title: headerWithTooltip('Resource Application Status', 'Resource Application Status'),
                    field: 'proposalStatus',
                    hidden: !settings.tables.visibleColumns.proposalStatus,
                },
                {
                    title: headerWithTooltip('Therapeutic Area', 'Therapeutic Area'),
                    field: 'therapeuticArea',
                    hidden: !settings.tables.visibleColumns.therapeuticArea,
                },
                {
                    title: headerWithTooltip('Submitting Institution', 'Submitting Institution'),
                    field: 'submitterInstitution',
                    hidden: !settings.tables.visibleColumns.submitterInstitution,
                },
                {
                    title: headerWithTooltip('Assigned TIC/RIC', 'Assigned TIC/RIC'),
                    field: 'assignToInstitution',
                    hidden: !settings.tables.visibleColumns.assignToInstitution,
                },
                {
                    title: headerWithTooltip('Submission Date', 'Submission Date'),
                    field: 'dateSubmitted',
                    hidden: !settings.tables.visibleColumns.dateSubmitted, 
                },
                {
                    title: headerWithTooltip('PAT Review Date', 'PAT Review Date'),
                    field: 'meetingDate',
                    hidden: !settings.tables.visibleColumns.meetingDate,
                },
                {
                    title: headerWithTooltip('Planned Grant Submission Date', 'Planned Grant Submission Date'),
                    field: 'plannedGrantSubmissionDate',
                    hidden: !settings.tables.visibleColumns.plannedGrantSubmissionDate,
                },
                {
                    title: headerWithTooltip('Actual Grant Submission Date', 'Actual Grant Submission Date'),
                    field: 'actualGrantSubmissionDate',
                    hidden: !settings.tables.visibleColumns.actualGrantSubmissionDate,
                },
                {
                    title: headerWithTooltip('Funding Source', 'Funding Source'),
                    field: 'fundingSource',
                    hidden: !settings.tables.visibleColumns.fundingSource,
                },
                {
                    title: headerWithTooltip('New Funding Source', 'New Funding Source'),
                    field: 'newFundingSource',
                    hidden: !settings.tables.visibleColumns.newFundingSource,
                },
                {
                    title: headerWithTooltip('Funding Status', 'Funding Status'),
                    field: 'fundingStatus',
                    hidden: !settings.tables.visibleColumns.fundingStatus,
                },
                {
                    title: headerWithTooltip('Grant Award Date', 'Grant Award Date'),
                    field: 'fundingStart',
                    hidden: !settings.tables.visibleColumns.fundingStart,
                },
                {
                    title: headerWithTooltip('Funding Amount', 'Funding Amount'),
                    field: 'fundingAmount',
                    hidden: !settings.tables.visibleColumns.fundingAmount,
                },
                {
                    title: headerWithTooltip('Funding Period', 'Funding Period'),
                    field: 'fundingPeriod',
                    hidden: !settings.tables.visibleColumns.fundingPeriod,
                },
                {
                    title: headerWithTooltip('Estimated Funding Start Date', 'Estimated Funding Start Date'),
                    field: 'estimatedFundingStartDate',
                    hidden: !settings.tables.visibleColumns.estimatedFundingStartDate,
                },
                {
                    title: headerWithTooltip('Actual Funding Start Date', 'Actual Funding Start Date'),
                    field: 'actualFundingStartDate',
                    hidden: !settings.tables.visibleColumns.actualFundingStartDate,
                },
                {
                    title: headerWithTooltip('Approved for Comprehensive Consultation', 'Approved for Comprehensive Consultation'),
                    field: 'approvedForComprehensiveConsultation',
                    hidden: !settings.tables.visibleColumns.approvedForComprehensiveConsultation,
                    render: rowData => rowData.approvedForComprehensiveConsultation ? 'YES' : '',
                    // filtering: false,
                },
                {
                    title: headerWithTooltip('Study Population', 'Study Population'),
                    field: 'studyPopulation',
                    hidden: !settings.tables.visibleColumns.studyPopulation,
                },
                {
                    title: headerWithTooltip('Phase', 'Phase'),
                    field: 'phase',
                    hidden: !settings.tables.visibleColumns.phase,
                },
                {
                    title: headerWithTooltip('Funding Insitute 1', 'Funding Insitute 1'),
                    field: 'fundingInstitute',
                    hidden: !settings.tables.visibleColumns.fundingInstitute,
                },
                {
                    title: headerWithTooltip('Funding Insitute 2', 'Funding Insitute 2'),
                    field: 'fundingInstitute2',
                    hidden: !settings.tables.visibleColumns.fundingInstitute2,
                },
                {
                    title: headerWithTooltip('Funding Insitute 3', 'Funding Insitute 3'),
                    field: 'fundingInstitute3',
                    hidden: !settings.tables.visibleColumns.fundingInstitute3,
                },
                {
                    title: headerWithTooltip('Funding Source Confirmation', 'Funding Source Confirmation'),
                    field: 'fundingSourceConfirmation',
                    hidden: !settings.tables.visibleColumns.fundingSourceConfirmation,
                },
                {
                    title: headerWithTooltip('Notable Risk', 'Notable Risk'),
                    field: 'notableRisk',
                    hidden: !settings.tables.visibleColumns.notableRisk,
                    render: rowData => rowData.notableRisk ? 'YES' : '',
                },
                {
                    title: headerWithTooltip('Number of CTSA Program Hub Sites', 'Number of CTSA Program Hub Sites'),
                    field: 'numberCTSAprogHubSites',
                    hidden: !settings.tables.visibleColumns.numberCTSAprogHubSites,
                },
                {
                    title: headerWithTooltip('Number of Sites', 'Number of Sites'),
                    field: 'numberSites',
                    hidden: !settings.tables.visibleColumns.numberSites,
                },

                {
                    title: headerWithTooltip('Actual Protocol Final Date', 'Actual Protocol Final Date'),
                    field: 'actualProtocolFinalDate',
                    hidden: !settings.tables.visibleColumns.actualProtocolFinalDate,
                },
                {
                    title: headerWithTooltip('Actual Grant Award Date', 'Actual Grant Award Date'),
                    field: 'actualGrantAwardDate',
                    hidden: !settings.tables.visibleColumns.actualGrantAwardDate,
                },
                {
                    title: headerWithTooltip('Approval Release Diff', 'Approval Release Diff'),
                    field: 'approvalReleaseDiff',
                    hidden: !settings.tables.visibleColumns.approvalReleaseDiff,
                },
                {
                    title: headerWithTooltip('COVID Study', 'COVID Study'),
                    field: 'covidStudy',
                    hidden: !settings.tables.visibleColumns.covidStudy,
                    render: rowData => rowData.covidStudy ? 'YES' : '',
                },
            ].concat(resources.map(
                resource => ({
                        title: `Resource: ${ resource }`,
                        field: resource,
                        hidden: !settings.tables.visibleColumns.resources,
                    })
                ))
            }
            data={ proposals }
            options={{
                paging: false,
                columnsButton: true,
                exportButton: true,
                filtering: true,
                grouping: true,
                exportFileName: title,
            }}
            components={{
                GroupRow: rowData => CustomTableGroupRow(rowData)
            }}
            detailPanel={ rowData => <ProposalDetailPanel { ...rowData } />}
            onRowClick={ (event, rowData, togglePanel) => togglePanel() }
        />
    )
}
