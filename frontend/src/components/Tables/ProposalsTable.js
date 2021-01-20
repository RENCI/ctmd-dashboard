import React, { useContext, useEffect, useState } from 'react'
import MaterialTable from 'material-table'
import { SettingsContext } from '../../contexts'
import { ProposalDetailPanel } from './DetailPanels'
import { Check as CheckIcon } from '@material-ui/icons'
import { Tooltip, TableCell } from '@material-ui/core'

const resources = [
    'EHR-Based Cohort Assessment',
    'Community Engagement Studio',
    'Recruitment Plan',
    'Recruitment Feasibility Assessment',
    'Recruitment Materials',
    'Operationalize Single IRB',
    'Operationalize Standard Agreements',
    'Other',
    'Study Planning (Design, Budget, Timelines, Feasibility)'
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
                    title: headerWithTooltip('Proposal Name', 'Short title of the TIN project proposal'),
                    field: 'shortTitle',
                    hidden: !settings.tables.visibleColumns.shortTitle,
                },
                {
                    title: headerWithTooltip('PI', 'Principal Investigator'),
                    field: 'piName',
                    hidden: !settings.tables.visibleColumns.piName,
                },
                {
                    title: headerWithTooltip('Proposal Status', 'Proposal Status'),
                    field: 'proposalStatus',
                    hidden: !settings.tables.visibleColumns.proposalStatus,
                },
                {
                    title: headerWithTooltip('Therapeutic Area', 'Therapeutic area of the study'),
                    field: 'therapeuticArea',
                    hidden: !settings.tables.visibleColumns.therapeuticArea,
                },
                {
                    title: headerWithTooltip('Submitting Institution', "Submitter's organization name"),
                    field: 'submitterInstitution',
                    hidden: !settings.tables.visibleColumns.submitterInstitution,
                },
                {
                    title: headerWithTooltip('Assigned TIC/RIC', 'TIC/RIC to which the study is assigned to carry out the consultation'),
                    field: 'assignToInstitution',
                    hidden: !settings.tables.visibleColumns.assignToInstitution,
                },
                {
                    title: headerWithTooltip('Submission Date', 'Date proposal was submitted to TIN'),
                    field: 'dateSubmitted',
                    hidden: !settings.tables.visibleColumns.dateSubmitted, 
                },
                {
                    title: headerWithTooltip('PAT Review Date', 'Proposal Assessment Team Review Date'),
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
                    title: headerWithTooltip('Funding Source', 'Current funding source of the study/trial'),
                    field: 'fundingSource',
                    hidden: !settings.tables.visibleColumns.fundingSource,
                },
                {
                    title: headerWithTooltip('New Funding Source', 'New Funding Source'),
                    field: 'newFundingSource',
                    hidden: !settings.tables.visibleColumns.newFundingSource,
                },
                {
                    title: headerWithTooltip('Funding Status', 'New Funding Status'),
                    field: 'fundingStatus',
                    hidden: !settings.tables.visibleColumns.fundingStatus,
                },
                {
                    title: headerWithTooltip('Grant Award Date', 'Actual Grant Award Date'),
                    field: 'fundingStart',
                    hidden: !settings.tables.visibleColumns.fundingStart,
                },
                {
                    title: headerWithTooltip('Funding Amount', 'Total amount awarded for the study'),
                    field: 'fundingAmount',
                    hidden: !settings.tables.visibleColumns.fundingAmount,
                },
                {
                    title: headerWithTooltip('Funding Period', 'Total duration of the funding period'),
                    field: 'fundingPeriod',
                    hidden: !settings.tables.visibleColumns.fundingPeriod,
                },
                {
                    title: headerWithTooltip('Estimated Funding Start Date', 'Projected/Estimated Funding Start Date'),
                    field: 'estimatedFundingStartDate',
                    hidden: !settings.tables.visibleColumns.estimatedFundingStartDate,
                },
                {
                    title: headerWithTooltip('Actual Funding Start Date', 'Actual Funding Start Date'),
                    field: 'actualFundingStartDate',
                    hidden: !settings.tables.visibleColumns.actualFundingStartDate,
                },
                // {
                //     title: headerWithTooltip('Recommend for Comprehensive Consultation', 'Recommend for Comprehensive Consultation'),
                //     field: 'approvedForComprehensiveConsultation',
                //     hidden: !settings.tables.visibleColumns.approvedForComprehensiveConsultation,
                //     // filtering: false,
                // },
                {
                    title: headerWithTooltip('Study Population', 'Study Population Category'),
                    field: 'studyPopulation',
                    hidden: !settings.tables.visibleColumns.studyPopulation,
                },
                {
                    title: headerWithTooltip('Phase', 'Study Phase'),
                    field: 'phase',
                    hidden: !settings.tables.visibleColumns.phase,
                },
                {
                    title: headerWithTooltip('Funding Insitute 1', 'Institute/Center for first funding source'),
                    field: 'fundingInstitute',
                    hidden: !settings.tables.visibleColumns.fundingInstitute,
                },
                {
                    title: headerWithTooltip('Funding Insitute 2', 'Insitute/Center for second funding source'),
                    field: 'fundingInstitute2',
                    hidden: !settings.tables.visibleColumns.fundingInstitute2,
                },
                {
                    title: headerWithTooltip('Funding Insitute 3', 'Insitute/Center for third funding source'),
                    field: 'fundingInstitute3',
                    hidden: !settings.tables.visibleColumns.fundingInstitute3,
                },
                {
                    title: headerWithTooltip('Funding Source Confirmation', 'Confirm whether the anticipated funding source is same or different'),
                    field: 'fundingSourceConfirmation',
                    hidden: !settings.tables.visibleColumns.fundingSourceConfirmation,
                },
                {
                    title: headerWithTooltip('Notable Risk', 'Is there an identified risk?'),
                    field: 'notableRisk',
                    hidden: !settings.tables.visibleColumns.notableRisk,
                },
                {
                    title: headerWithTooltip('Number of CTSA Program Hub Sites', 'Number of CTSA Program Hub Sites'),
                    field: 'numberCTSAprogHubSites',
                    hidden: !settings.tables.visibleColumns.numberCTSAprogHubSites,
                },
                {
                    title: headerWithTooltip('Number of Sites', 'Estimated number of Sites'),
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
                    title: headerWithTooltip('Approval Release Diff', 'Difference between PAT approval and actual release of funds'),
                    field: 'approvalReleaseDiff',
                    hidden: !settings.tables.visibleColumns.approvalReleaseDiff,
                },
                {
                    title: headerWithTooltip('COVID Study', 'Is this a COVID related study?'),
                    field: 'covidStudy',
                    hidden: !settings.tables.visibleColumns.covidStudy,
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
                groupTitle: rowData => {
                    console.log(rowData)
                    return 'TITLE'
                }
            }}
            detailPanel={ rowData => <ProposalDetailPanel { ...rowData } />}
            onRowClick={ (event, rowData, togglePanel) => togglePanel() }
        />
    )
}
