import React, { useState, useContext, useEffect } from 'react'
import { makeStyles } from '@material-ui/styles'
import MaterialTable from 'material-table'
import { Collapse } from '@material-ui/core'
import { Grid, Typography, Divider } from '@material-ui/core'
import { List, ListItem, ListItemText, ListItemIcon, ListItemAvatar, Avatar } from '@material-ui/core'
import { Subheading, Paragraph } from '../../components/Typography'
import { StoreContext } from '../../contexts/StoreContext'
import { SiteDetailPanel } from './DetailPanels'

export const SitesTable = (props) => {
    let { title, sites } = props
    const [store, ] = useContext(StoreContext)
    if (title) title += ` (${ sites.length } Sites)`

    useEffect(() => {
        if (sites && store.proposals) {
            let protocols = {}
            sites.forEach(site => {
                if (protocols.hasOwnProperty(site.proposalID)) {
                    site.protocol = protocols[site.proposalID]
                } else {
                    const { shortTitle } = store.proposals.find(proposal => proposal.proposalID == site.proposalID)
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
                    { title: 'Facility Name', field: 'siteName', hidden: false, },
                    { title: 'Site Name', field: 'principalInvestigator', hidden: false, },
                    { title: 'Reg Packet Sent', field: 'dateRegPacketSent', hidden: false, },
                    { title: 'Contract Sent', field: 'dateContractSent', hidden: false, },
                    { title: 'IRB Submission', field: 'dateIrbSubmission', hidden: true, },
                    { title: 'IRB Approval', field: 'dateIrbApproval', hidden: true, },
                    { title: 'Contract Execution', field: 'dateContractExecution', hidden: true, },
                    { title: 'LPFV', field: 'lpfv', hidden: true, },
                    { title: 'Site Activation', field: 'dateSiteActivated', hidden: true, },
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
                detailPanelType: 'multiple',
            }}
            detailPanel={rowData => <SiteDetailPanel { ...rowData } />}
            onRowClick={(event, rowData, togglePanel) => togglePanel()}
        />
    )
}