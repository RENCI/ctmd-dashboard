import React, { useContext, useEffect, useState } from 'react'
import MaterialTable from 'material-table'
import { SettingsContext } from '../../contexts'
import { ProposalDetailPanel } from './DetailPanels'
import { Check as CheckIcon } from '@material-ui/icons'

const defaultPageSizeOptions = [15, 25, 50, 100, 200]

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

export const ProposalsTable = ({ title, proposals, components, ...props }) => {
    const [settings] = useContext(SettingsContext)
    const [pageSizeOptions, setPageSizeOptions] = useState(defaultPageSizeOptions)

    useEffect(() => {
        if (proposals) {
            // Add length of proposals array as a page size option
            const newPageSizes = defaultPageSizeOptions.filter(size => size <= proposals.length)
            if ((proposals.length) > newPageSizes[newPageSizes.length - 1]) {
                setPageSizeOptions(newPageSizes.concat(proposals.length))
            } else {
                setPageSizeOptions(newPageSizes)
            }

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
            components={ components }
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
                    title: 'Resource Application Status', field: 'proposalStatus',
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
                    title: 'Funding Source', field: 'fundingSource',
                    hidden: !settings.tables.visibleColumns.fundingSource,
                },
                {
                    title: 'New Funding Source', field: 'newFundingSource',
                    hidden: !settings.tables.visibleColumns.newFundingSource,
                },
                {
                    title: 'Funding Status', field: 'fundingStatus',
                    hidden: !settings.tables.visibleColumns.fundingStatus,
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
                {
                    title: 'Estimated Funding Start Date', field: 'estimatedFundingStartDate',
                    hidden: !settings.tables.visibleColumns.estimatedFundingStartDate,
                },
                {
                    title: 'Actual Funding Start Date', field: 'actualFundingStartDate',
                    hidden: !settings.tables.visibleColumns.actualFundingStartDate,
                },
                {
                    title: 'Approved for Comprehensive Consultation', field: 'approvedForComprehensiveConsultation',
                    hidden: !settings.tables.visibleColumns.approvedForComprehensiveConsultation,
                    render: rowData => rowData.approvedForComprehensiveConsultation ? <CheckIcon /> : '',
                    // filtering: false,
                },
                {
                    title: 'Study Population', field: 'studyPopulation',
                    hidden: !settings.tables.visibleColumns.studyPopulation,
                },
                {
                    title: 'Phase', field: 'phase',
                    hidden: !settings.tables.visibleColumns.phase,
                },
                {
                    title: 'Funding Insitute 1', field: 'fundingInstitute',
                    hidden: !settings.tables.visibleColumns.fundingInstitute,
                },
                {
                    title: 'Funding Insitute 2', field: 'fundingInstitute2',
                    hidden: !settings.tables.visibleColumns.fundingInstitute2,
                },
                {
                    title: 'Funding Insitute 3', field: 'fundingInstitute3',
                    hidden: !settings.tables.visibleColumns.fundingInstitute3,
                },
                {
                    title: 'Funding Source Confirmation', field: 'fundingSourceConfirmation',
                    hidden: !settings.tables.visibleColumns.fundingSourceConfirmation,
                },
                {
                    title: 'Notable Risk', field: 'notableRisk',
                    hidden: !settings.tables.visibleColumns.notableRisk,
                    render: rowData => rowData.notableRisk ? 'true' : 'false',
                },
                {
                    title: 'Number of CTSA Program Hub Sites', field: 'numberCTSAprogHubSites',
                    hidden: !settings.tables.visibleColumns.numberCTSAprogHubSites,
                },
                {
                    title: 'Number of Sites', field: 'numberSites',
                    hidden: !settings.tables.visibleColumns.numberSites,
                },

                {
                    title: 'Actual Protocol Final Date', field: 'actualProtocolFinalDate',
                    hidden: !settings.tables.visibleColumns.actualProtocolFinalDate,
                },
                {
                    title: 'Actual Grant Award Date', field: 'actualGrantAwardDate',
                    hidden: !settings.tables.visibleColumns.actualGrantAwardDate,
                },
                {
                    title: 'Approval Release Diff', field: 'approvalReleaseDiff',
                    hidden: !settings.tables.visibleColumns.approvalReleaseDiff,
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
                paging: props.paging,
                columnsButton: true,
                exportButton: true,
                filtering: true,
                grouping: true,
                pageSize: settings.tables.pageSize,
                pageSizeOptions: pageSizeOptions,
                exportFileName: title,
            }}
            detailPanel={ rowData => <ProposalDetailPanel { ...rowData } />}
            onRowClick={ (event, rowData, togglePanel) => togglePanel() }
        />
    )
}
