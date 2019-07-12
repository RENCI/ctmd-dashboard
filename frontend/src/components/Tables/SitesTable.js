import React, { useState, useContext, useEffect } from 'react'
import { makeStyles } from '@material-ui/styles'
import MaterialTable from 'material-table'
import { Grid, Typography } from '@material-ui/core'
import { Paragraph } from '../../components/Typography'
import { Collapse } from '@material-ui/core'
import { StoreContext } from '../../contexts/StoreContext'

const useStyles = makeStyles(theme => ({
    panel: {
        padding: `${ theme.spacing(2) }px ${ theme.spacing(4) }px`,
        backgroundColor: theme.palette.extended.gingerBeer,
    },
    header: {
        marginBottom: theme.spacing(2),
        borderBottom: `1px solid ${ theme.palette.grey[300] }`,
        alignItems: 'center',
    },
    title: {
        padding: `${ theme.spacing(2) }px 0`,
        color: theme.palette.secondary.main,
        fontWeight: 'bold',
        letterSpacing: '1px',
        display: 'block',
    },
}))

const SiteDetailPanel = ({
    shortTitle: proposalShortTitle,
    siteName, 
    dateRegPacketSent,
    dateContractSent,
    dateIrbSubmission,
    dateIrbApproval,
    dateContractExecution,
    lpfv,
    dateSiteActivated,
    fpfv,
    patientsConsentedCount,
    patientsEnrolledCount,
    patientsWithdrawnCount,
    patientsExpectedCount,
    queriesCount,
    protocolDeviationsCount,
}) => {
    const [expanded, setExpanded] = useState(false)
    const classes = useStyles()

    useEffect(() => {
        setExpanded(true)
    }, [])
    
    const dayCount = (startDate, endDate) => {
        if (startDate && endDate) {
            const num = Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
            return `${ num } day${ num === 1 ? '' : 's' }`
        } else {
            return 'N/A'
        }
    }

    const displayRatio = (a, b, precision = 2) => {
        if (a === 0) {
            if (b === 0) return `N/A`
            return `0% (${ a }/${ b })`
        }
        return b !== 0
            ? `${ (100 * a/b).toFixed(precision) }% (${ a }/${ b })`
            : `N/A`
    }



    return (
        <Collapse in={ expanded }>
            <Grid container className={ classes.panel }>
                <Grid item xs={ 12 } className={ classes.header }>
                    <Typography variant="h5" className={ classes.title }>{ siteName }</Typography>
                </Grid>
                <Grid item xs={ 12 }>
                    <Paragraph>
                        Protocol Available to FPFV: { fpfv }
                    </Paragraph>
                    <Paragraph>
                        Contract approval/execution cycle time: { dayCount(dateContractSent, dateContractExecution) }
                    </Paragraph>
                    <Paragraph>
                        IRB approval cycle time (Full Committee Review): { dayCount(dateIrbSubmission, dateIrbApproval) }
                    </Paragraph>
                    <Paragraph>
                        Site open to accrual to First Patient / First Visit (FPFV): { fpfv || 'N/A' }
                    </Paragraph>
                    <Paragraph>
                        Site open to accrual to Last Patient / First Visit: { lpfv || 'N/A' }
                    </Paragraph>
                    <Paragraph>
                        Randomized patients / Consented patients: { displayRatio(patientsEnrolledCount, patientsConsentedCount) }
                    </Paragraph>
                    <Paragraph>
                        Actual vs expected randomized patient ratio: { displayRatio(patientsEnrolledCount, patientsExpectedCount) }
                    </Paragraph>
                    <Paragraph>
                        Ratio of randomized patients that dropout of the study: { displayRatio(patientsWithdrawnCount, patientsEnrolledCount) }
                    </Paragraph>
                    <Paragraph>
                        Major protocol deviations / randomized patient: { displayRatio(protocolDeviationsCount, patientsEnrolledCount) }
                    </Paragraph>
                    <Paragraph>
                        Queries per eCRF page: { queriesCount || 'N/A' }
                    </Paragraph>
                </Grid>
            </Grid>
        </Collapse>
    )
}

const SitesTable = (props) => {
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

export default SitesTable