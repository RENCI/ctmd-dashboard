import React, { Fragment, useState, useContext, useEffect } from 'react'
import { makeStyles } from '@material-ui/styles'
import MaterialTable from 'material-table'
import { Grid, Typography } from '@material-ui/core'
import { Paragraph } from '../../components/Typography/Typography'
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
    regPacksentdate,
    contractsent_date,
    irbsubmission_date,
    IRBOriginalApproval,
    contractexecution_date,
    mostRecentEnrolled,
    siteActivatedDate,
    dateOfFirstPtEnrolled,
    noOfPtsSignedConsent,
    noOfPtsEnrolled_site,
    noOfPtsWithdrawn_site,
    projectedEnrollmentPerMonth,
    noOfUnresolvedQueries_site,
    noOfSignificantProtocolDeviations_site,
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
                        Protocol Available to FPFV: { dateOfFirstPtEnrolled }
                    </Paragraph>
                    <Paragraph>
                        Contract approval/execution cycle time: { dayCount(contractsent_date, contractexecution_date) }
                    </Paragraph>
                    <Paragraph>
                        IRB approval cycle time (Full Committee Review): { dayCount(irbsubmission_date, IRBOriginalApproval) }
                    </Paragraph>
                    <Paragraph>
                        Site open to accrual to First Patient / First Visit (FPFV): { dateOfFirstPtEnrolled || 'N/A' }
                    </Paragraph>
                    <Paragraph>
                        Site open to accrual to Last Patient / First Visit: { mostRecentEnrolled || 'N/A' }
                    </Paragraph>
                    <Paragraph>
                        Randomized patients / Consented patients: { displayRatio(noOfPtsEnrolled_site, noOfPtsSignedConsent) }
                    </Paragraph>
                    <Paragraph>
                        Actual vs expected randomized patient ratio: { displayRatio(noOfPtsEnrolled_site, projectedEnrollmentPerMonth) }
                    </Paragraph>
                    <Paragraph>
                        Ratio of randomized patients that dropout of the study: { displayRatio(noOfPtsWithdrawn_site, noOfPtsEnrolled_site) }
                    </Paragraph>
                    <Paragraph>
                        Major protocol deviations / randomized patient: { displayRatio(noOfSignificantProtocolDeviations_site, noOfPtsEnrolled_site) }
                    </Paragraph>
                    <Paragraph>
                        Queries per eCRF page: { noOfUnresolvedQueries_site || 'N/A' }
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
                    { title: 'Protocol', field: 'protocol', hidden: false, },
                    { title: 'Facility Name', field: 'siteName', hidden: false, },
                    { title: 'Site Name', field: 'principalInvestigator', hidden: true, },
                    { title: 'regPacksentdate', field: 'regPacksentdate', hidden: true, },
                    { title: 'contractsent_date', field: 'contractsent_date', hidden: true, },
                    { title: 'irbsubmission_date', field: 'irbsubmission_date', hidden: true, },
                    { title: 'IRBOriginalApproval', field: 'IRBOriginalApproval', hidden: true, },
                    { title: 'contractexecution_date', field: 'contractexecution_date', hidden: true, },
                    { title: 'mostRecentEnrolled', field: 'mostRecentEnrolled', hidden: true, },
                    { title: 'siteActivatedDate', field: 'siteActivatedDate', hidden: true, },
                    { title: 'dateOfFirstPtEnrolled', field: 'dateOfFirstPtEnrolled', hidden: true, },
                    { title: 'noOfPtsSignedConsent', field: 'noOfPtsSignedConsent', hidden: true, },
                    { title: 'noOfPtsEnrolled_site', field: 'noOfPtsEnrolled_site', hidden: true, },
                    { title: 'noOfPtsWithdrawn_site', field: 'noOfPtsWithdrawn_site', hidden: true, },
                    { title: 'projectedEnrollmentPerMonth', field: 'projectedEnrollmentPerMonth', hidden: true, },
                    { title: 'noOfUnresolvedQueries_site', field: 'noOfUnresolvedQueries_site', hidden: true, },
                    { title: 'noOfSignificantProtocolDeviations_site', field: 'noOfSignificantProtocolDeviations_site', hidden: true, },
                ]
            }
            data={ sites }
            options={{
                paging: props.paging,
                columnsButton: true,
                exportButton: true,
                filtering: true,
                grouping: true,
                pageSize: 15,
                pageSizeOptions: [15, 25, 50, 100, 200],
                exportFileName: title,
                detailPanelType: 'multiple',
            }}
            detailPanel={rowData => <SiteDetailPanel { ...rowData } />}
            onRowClick={(event, rowData, togglePanel) => togglePanel()}
        />
    )
}

export default SitesTable