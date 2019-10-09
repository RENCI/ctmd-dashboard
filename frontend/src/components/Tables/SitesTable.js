import React, { useContext, useEffect } from 'react'
import MaterialTable from 'material-table'
import { StoreContext } from '../../contexts/StoreContext'
import { SiteDetailPanel } from './DetailPanels'

export const SitesTable = props => {
    let { title, sites } = props
    const [store, ] = useContext(StoreContext)
    if (title) title += ` (${ sites.length } Sites)`

    useEffect(() => {
        if (sites && store.proposals) {
            let protocols = {}
            sites.forEach(site => {
                if (protocols.hasOwnProperty(site.proposalId)) {
                    site.protocol = protocols[site.proposalId]
                } else {
                    const { shortTitle } = store.proposals.find(proposal => proposal.proposalId == site.proposalId)
                    site.protocol = shortTitle
                }
            })
        }
    }, [sites, store.proposals])

    return (
        <MaterialTable
            title={ title || '' }
            components={{ }}
            columns={
                [
                    { title: 'Protocol', field: 'protocol', hidden: true, },
                    { title: 'Site ID', field: 'siteId', hidden: false, },
                    { title: 'CTSA ID', field: 'ctsaId', hidden: true, },
                    { title: 'Site Name', field: 'siteName', hidden: false, },
                    { title: 'CTSA Name', field: 'ctsaName', hidden: false, },
                    { title: 'PI', field: 'principalInvestigator', hidden: false, },
                    { title: 'Reg Packet Sent', field: 'dateRegPacketSent', hidden: true, },
                    { title: 'Contract Sent', field: 'dateContractSent', hidden: true, },
                    { title: 'IRB Submission', field: 'dateIrbSubmission', hidden: true, },
                    { title: 'IRB Approval', field: 'dateIrbApproval', hidden: true, },
                    { title: 'Contract Execution', field: 'dateContractExecution', hidden: true, },
                    { title: 'Site Activation', field: 'dateSiteActivated', hidden: true, },
                    { title: 'LPFV', field: 'lpfv', hidden: true, },
                    { title: 'FPFV', field: 'fpfv', hidden: true, },
                    { title: 'Patients Consented', field: 'patientsConsentedCount', hidden: true, },
                    { title: 'Patients Enrolled', field: 'patientsEnrolledCount', hidden: true, },
                    { title: 'Patients Withdrawn', field: 'patientsWithdrawnCount', hidden: true, },
                    { title: 'Patients Expected', field: 'patientsExpectedCount', hidden: true, },
                    { title: 'Queries Count', field: 'queriesCount', hidden: true, },
                    { title: 'Protocol Deviations', field: 'protocolDeviationsCount', hidden: true, },
                ]
            }
            data={ sites }
            options={{
                paging: props.paging,
                columnsButton: true,
                exportButton: true,
                filtering: true,
                grouping: true,
                pageSize: 5,
                pageSizeOptions: [5, 10, 25],
                exportFileName: title,
            }}
            detailPanel={rowData => <SiteDetailPanel { ...rowData } />}
            onRowClick={(event, rowData, togglePanel) => togglePanel()}
        />
    )
}