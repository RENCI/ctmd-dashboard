import React, { useContext, useEffect } from 'react'
import MaterialTable from 'material-table'
import { StoreContext } from '../../contexts/StoreContext'
import { SiteDetailPanel, dayCount, displayRatio } from './DetailPanels'
import { EnrollmentBar } from '../Widgets/EnrollmentBar'

const invalidDisplay = 'N/A'

const ratioAsWholeNumberString = (a, b) => {
    return b === 0 ? invalidDisplay : Math.round(a / b)
}

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

                site.protocolToFpfv = dayCount(site.dateRegPacketSent, site.fpfv)
                site.contractExecutionTime = dayCount(site.dateContractSent, site.dateContractExecution)
                site.sirbApprovalTime = dayCount(site.dateIrbSubmission, site.dateIrbApproval)
                site.siteOpenToFpfv = dayCount(site.dateSiteActivated, site.fpfv)
                site.protocolToLpfv = dayCount(site.dateSiteActivated, site.lpfv)
                site.percentConsentedPtsRandomized = displayRatio(site.patientsEnrolledCount, site.patientsConsentedCount)
                site.actualToExpectedRandomizedPtRatio = displayRatio(site.patientsEnrolledCount, site.patientsExpectedCount)
                site.ratioRandomizedPtsDropout = displayRatio(site.patientsWithdrawnCount, site.patientsEnrolledCount)
                site.majorProtocolDeviationsPerRandomizedPt = displayRatio( site.protocolDeviationsCount, site.patientsEnrolledCount)
                site.queriesPerConsentedPatient = ratioAsWholeNumberString(site.queriesCount, site.patientsConsentedCount )
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
            components={{ }}
            columns={
                [
                    { title: 'Protocol (Short Description)', render: d => d.protocol.shortDescription, hidden: true, },
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
                    { title: 'Enrollment', render: bar, hidden: false, },
                    { title: 'Patients Consented', field: 'patientsConsentedCount', hidden: true, },
                    { title: 'Patients Enrolled', field: 'patientsEnrolledCount', hidden: true, },
                    { title: 'Patients Withdrawn', field: 'patientsWithdrawnCount', hidden: true, },
                    { title: 'Patients Expected', field: 'patientsExpectedCount', hidden: true, },
                    { title: 'Protocol Deviations', field: 'protocolDeviationsCount', hidden: true, },
                    { title: 'Lost to Follow Up', field: 'lostToFollowUp', hidden: true, },
                    { title: 'Protocol to FPFV', field: 'protocolToFpfv', hidden: true, },
                    { title: 'Contract Execution Time', field: 'contractExecutionTime', hidden: true, },
                    { title: 'sIRB Approval Time', field: 'sirbApprovalTime', hidden: true, },
                    { title: 'Site Open to FPFV', field: 'siteOpenToFpfv', hidden: true, },
                    { title: 'Site Open to LPFV', field: 'protocolToLpfv', hidden: true, },
                    { title: 'Percent of consented patients randomized', field: 'percentConsentedPtsRandomized', hidden: true, },
                    { title: 'Actual to expected randomized patient ratio', field: 'actualToExpectedRandomizedPtRatio', hidden: true, },
                    { title: 'Ratio of randomized patients that dropout of the study', field: 'ratioRandomizedPtsDropout', hidden: true, },
                    { title: 'Major Protocol deviations per randomized patient', field: 'majorProtocolDeviationsPerRandomizedPt', hidden: true, },
                    { title: 'Number of Queries', field: 'queriesCount', hidden: true, },
                    {
                        title: 'Queries per patient',
                        render: row => row.queriesPerConsentedPatient,
                        hidden: true,
                    },
                ]
            }
            data={ sites }
            options={{
                paging: props.paging,
                columnsButton: true,
                exportButton: true,
                filtering: true,
                grouping: true,
                paging: false,
                // pageSize: 5,
                // pageSizeOptions: [5, 10, 25],
                exportFileName: title,
            }}
            detailPanel={rowData => <SiteDetailPanel { ...rowData } />}
            onRowClick={(event, rowData, togglePanel) => togglePanel()}
        />
    )
}
