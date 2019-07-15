import React, { useState, useContext, useEffect } from 'react'
import { makeStyles } from '@material-ui/styles'
import MaterialTable from 'material-table'
import { Collapse } from '@material-ui/core'
import { Grid, Typography, Divider } from '@material-ui/core'
import { List, ListItem, ListItemText, ListItemIcon, ListItemAvatar, Avatar } from '@material-ui/core'
import { Star as MetricsIcon } from '@material-ui/icons'
import { Subheading, Paragraph } from '../../components/Typography'
import { StoreContext } from '../../contexts/StoreContext'

const useBulletStyles = makeStyles(theme => ({
    bullet: {
        fontSize: 24,
        color: theme.palette.primary.light,
        opacity: 0.25,
    }
}))

const Bullet = props => {
    const classes = useBulletStyles()
    return (
        <ListItemIcon>
            <MetricsIcon className={ classes.bullet } />
        </ListItemIcon>
    )
}

const usePanelStyles = makeStyles(theme => ({
    panel: {
        padding: `${ theme.spacing(2) }px ${ theme.spacing(4) }px`,
        backgroundColor: theme.palette.extended.hatteras,
    },
    header: {
        marginBottom: theme.spacing(2),
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
    const classes = usePanelStyles()

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
        a = parseInt(a)
        b = parseInt(b)
        if ( !a || !b ) {
            return 'N/A'
        }
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
                    <Subheading>{ siteName }</Subheading>
                </Grid>

                <Grid item component={ Divider } xs={ 12 } style={{ padding: 0 }}/>

                <Grid item xs={ 12 } md={ 6 }>
                    <List>
                        <ListItem>
                            <Bullet /><ListItemText primary="Protocol Available to FPFV:" secondary={ fpfv } />
                        </ListItem>
                        <ListItem>
                            <Bullet /><ListItemText primary="Contract approval/execution cycle time:" secondary={ dayCount(dateContractSent, dateContractExecution) } />
                        </ListItem>
                        <ListItem>
                            <Bullet /><ListItemText primary="IRB approval cycle time (Full Committee Review):" secondary={ dayCount(dateIrbSubmission, dateIrbApproval) } />
                        </ListItem>
                        <ListItem>
                            <Bullet /><ListItemText primary="Site open to accrual to First Patient / First Visit (FPFV):" secondary={ fpfv || 'N/A' } />
                        </ListItem>
                        <ListItem>
                            <Bullet /><ListItemText primary="Site open to accrual to Last Patient / First Visit:" secondary={ lpfv || 'N/A' } />
                        </ListItem>
                    </List>
                </Grid>
                <Grid item xs={ 12 } md={ 6 }>
                    <List>
                        <ListItem>
                            <Bullet /><ListItemText primary="Randomized patients / Consented patients:" secondary={ displayRatio(patientsEnrolledCount, patientsConsentedCount) } />
                        </ListItem>
                        <ListItem>
                            <Bullet /><ListItemText primary="Actual vs expected randomized patient ratio:" secondary={ displayRatio(patientsEnrolledCount, patientsExpectedCount) } />
                        </ListItem>
                        <ListItem>
                            <Bullet /><ListItemText primary="Ratio of randomized patients that dropout of the study:" secondary={ displayRatio(patientsWithdrawnCount, patientsEnrolledCount) } />
                        </ListItem>
                        <ListItem>
                            <Bullet /><ListItemText primary="Major protocol deviations / randomized patient:" secondary={ displayRatio(protocolDeviationsCount, patientsEnrolledCount) } />
                        </ListItem>
                        <ListItem>
                            <Bullet /><ListItemText primary="Queries per eCRF page:" secondary={ queriesCount || 'N/A' } />
                        </ListItem>
                    </List>
                </Grid>

            </Grid>
        </Collapse>
    )
}

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
