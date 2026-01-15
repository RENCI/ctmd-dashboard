import React, { useContext, useEffect } from 'react'
import MaterialTable from 'material-table'
import { StoreContext } from '../../contexts/StoreContext'
import { SiteDetailPanel } from './DetailPanels'
import { EnrollmentBar } from '../Widgets/EnrollmentBar'
import { computeMetrics } from '../../utils/sites'

export const SitesTable = props => {
    let { title, sites } = props
    const [store, ] = useContext(StoreContext)
    if (title) title += ` (${ sites.length } Sites)`

    useEffect(() => {
        if (sites && store.proposals) {
            let protocols = {}
            for (const site of sites) {
                if (protocols.hasOwnProperty(site.proposalId)) {
                    site.protocol = protocols[site.proposalId]
                } else {
                     const shortTitle  = store.proposals.find(proposal => proposal.proposalID == site.ProposalID)
                     site.protocol = shortTitle
                }

                computeMetrics(site)                
                site.shortDescription = site.protocol.shortDescription
            }
        }
    }, [sites, store.proposals])

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
                    { title: 'Protocol (Short Description)', field: 'shortDescription', hidden: true, },
                    { title: 'Site ID', field: 'siteId', hidden: false, },
                    { title: 'CTSA ID', field: 'ctsaId', hidden: true, },
                    { title: 'Site Name', field: 'siteName', hidden: false, },
                    { title: 'Site Number', field: 'siteNumber', hidden: false, },
                    { title: 'CTSA Name', field: 'ctsaName', hidden: false, },
                    { title: 'PI', field: 'principalInvestigator', hidden: false, },
                    { title: 'Date Protocol Sent', field: 'dateRegPacketSent', hidden: true, },
                    { title: 'Contract Sent', field: 'dateContractSent', hidden: true, },
                    { title: 'IRB Submission', field: 'dateIrbSubmission', hidden: true, },
                    { title: 'IRB Approval', field: 'dateIrbApproval', hidden: true, },
                    { title: 'Contract Execution', field: 'dateContractExecution', hidden: true, },
                    { title: 'Site Activation', field: 'dateSiteActivated', hidden: true, },
                    { title: 'LPFV', field: 'lpfv', hidden: true, },
                    { title: 'FPFV', field: 'fpfv', hidden: true, },
                    { title: 'Enrollment', field: 'enrollment', render: bar, hidden: false, },
                    { title: 'Patients Consented', field: 'patientsConsentedCount', hidden: true, },
                    { title: 'Patients Enrolled', field: 'patientsEnrolledCount', hidden: true, },
                    { title: 'Patients Withdrawn', field: 'patientsWithdrawnCount', hidden: true, },
                    { title: 'Patients Expected', field: 'patientsExpectedCount', hidden: true, },
                    { title: 'Protocol Deviations', field: 'protocolDeviationsCount', hidden: true, },
                    { title: 'Lost to Follow Up', field: 'lostToFollowUp', hidden: true, },
                    { title: 'Protocol to FPFV', field: 'protocolToFpfvDisplay', hidden: true, },
                    { title: 'Contract Execution Time', field: 'contractExecutionTimeDisplay', hidden: true, },
                    { title: 'sIRB Approval Time', field: 'sirbApprovalTimeDisplay', hidden: true, },
                    { title: 'Site Open to FPFV', field: 'siteOpenToFpfvDisplay', hidden: true, },
                    { title: 'Site Open to LPFV', field: 'protocolToLpfvDisplay', hidden: true, },
                    { title: 'Percent of consented patients randomized', field: 'percentConsentedPtsRandomizedDisplay', hidden: true, },
                    { title: 'Actual to expected randomized patient ratio', field: 'actualToExpectedRandomizedPtRatioDisplay', hidden: true, },
                    { title: 'Ratio of randomized patients that dropout of the study', field: 'ratioRandomizedPtsDropoutDisplay', hidden: true, },
                    { title: 'Major Protocol deviations per randomized patient', field: 'majorProtocolDeviationsPerRandomizedPtDisplay', hidden: true, },
                    { title: 'Number of Queries', field: 'queriesCount', hidden: true, },
                    { title: 'Queries per patient', field: 'queriesPerConsentedPatientDisplay', hidden: true, },
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
