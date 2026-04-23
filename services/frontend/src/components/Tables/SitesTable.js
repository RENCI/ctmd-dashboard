import React, { useEffect, useContext } from 'react'
import MaterialTable from 'material-table'
import { SiteDetailPanel } from './DetailPanels'
import { EnrollmentBar } from '../Widgets/EnrollmentBar'
import { computeMetrics } from '../../utils/sites'
import { StoreContext } from '../../contexts'

export const SitesTable = props => {
    let { title, sites } = props
    // Use unfiltered proposals for lookup - sites need protocol info regardless of HEAL filter
    const [store] = useContext(StoreContext)
    const proposals = store.proposals
    if (title) title += ` (${ sites.length } Sites)`

    useEffect(() => {
        if (sites && proposals) {
            let protocols = {}
            for (const site of sites) {
                if (protocols.hasOwnProperty(site.proposalId)) {
                    site.protocol = protocols[site.proposalId]
                } else {
                     const shortTitle  = proposals.find(proposal => proposal.proposalID == site.ProposalID)
                     // Guard against missing proposal (site might reference deleted/non-HEAL proposal)
                     site.protocol = shortTitle || { shortDescription: 'Unknown' }
                }

                computeMetrics(site)
                site.shortDescription = site.protocol.shortDescription
            }
        }
    }, [sites, proposals])

    const barHeight = 18
    const barWidth = 200

    const barColor = "#8da0cb"
    const barBackground = "#f3f5fa"

    const maxExpected = sites.reduce((p, c) => {
        return !c.patientsExpectedCount ? p : Math.max(p, +c.patientsExpectedCount);
    }, 0)

    const bar = row => {
        return (
            <EnrollmentBar
                data={ row }
                enrolledKey='patientsEnrolledCount'
                expectedKey='patientsExpectedCount'
                percentKey='percentEnrolled'
                maxValue={ maxExpected }
                height={ barHeight }
                width={ barWidth }
                color={ barColor }
                background={ barBackground } />
        )
    }

    return (
        <MaterialTable
            title={ null }
            columns={
                [
                    { title: 'Protocol (Short Description)', field: 'shortDescription', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Site ID', field: 'siteId', hidden: false, },
                    { title: 'CTSA ID', field: 'ctsaId', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Site Name', field: 'siteName', hidden: false, },
                    { title: 'Site Number', field: 'siteNumber', hidden: false, },
                    { title: 'CTSA Name', field: 'ctsaName', hidden: false, },
                    { title: 'PI', field: 'principalInvestigator', hidden: false, },
                    { title: 'Date Protocol Sent', field: 'dateRegPacketSent', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Contract Sent', field: 'dateContractSent', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'IRB Submission', field: 'dateIrbSubmission', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'IRB Approval', field: 'dateIrbApproval', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Contract Execution', field: 'dateContractExecution', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Site Activation', field: 'dateSiteActivated', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'LPFV', field: 'lpfv', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'FPFV', field: 'fpfv', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Enrollment', field: 'enrollment', render: bar, hidden: false, },
                    { title: 'Patients Consented', field: 'patientsConsentedCount', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Patients Enrolled', field: 'patientsEnrolledCount', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Patients Withdrawn', field: 'patientsWithdrawnCount', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Patients Expected', field: 'patientsExpectedCount', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Protocol Deviations', field: 'protocolDeviationsCount', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Lost to Follow Up', field: 'lostToFollowUp', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Protocol to FPFV', field: 'protocolToFpfvDisplay', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Contract Execution Time', field: 'contractExecutionTimeDisplay', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'sIRB Approval Time', field: 'sirbApprovalTimeDisplay', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Site Open to FPFV', field: 'siteOpenToFpfvDisplay', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Site Open to LPFV', field: 'protocolToLpfvDisplay', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Percent of consented patients randomized', field: 'percentConsentedPtsRandomizedDisplay', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Actual to expected randomized patient ratio', field: 'actualToExpectedRandomizedPtRatioDisplay', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Ratio of randomized patients that dropout of the study', field: 'ratioRandomizedPtsDropoutDisplay', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Major Protocol deviations per randomized patient', field: 'majorProtocolDeviationsPerRandomizedPtDisplay', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Number of Queries', field: 'queriesCount', hidden: true, hiddenByColumnsButton: true, },
                    { title: 'Queries per patient', field: 'queriesPerConsentedPatientDisplay', hidden: true, hiddenByColumnsButton: true, },
                ]
            }
            data={ sites }
            options={{
                paging: props.paging,
                columnsButton: true,
                exportButton: true,
                filtering: true,
                grouping: true,
                // pageSize: 5,
                // pageSizeOptions: [5, 10, 25],
                exportFileName: title,
            }}
            detailPanel={rowData => <SiteDetailPanel { ...rowData } />}
            onRowClick={(event, rowData, togglePanel) => togglePanel()}
        />
    )
}
