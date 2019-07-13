import React, { Fragment, useContext, useEffect, useState } from 'react'
import MaterialTable from 'material-table'
import { NavLink } from 'react-router-dom'
import { Grid, IconButton, Tooltip } from '@material-ui/core'
import { makeStyles, useTheme } from '@material-ui/styles'
import { BarChart as ReportIcon } from '@material-ui/icons'
import { UtahIcon } from '../Icons/Utah'
import { SettingsContext, StoreContext } from '../../contexts'
import { Subheading, Subsubheading, Paragraph, Caption } from '../../components/Typography'
import { CircularLoader } from '../../components/Progress/Progress'
import { formatDate } from '../../utils'
import { isSiteActive } from '../../utils/sites'
import { SitesActivationPieChart } from '../../components/Charts'

const useDetailPanelStyles = makeStyles(theme => ({
    detailPanel: {
        backgroundColor: theme.palette.extended.hatteras,
        padding: theme.spacing(4)
    },
    actions: {
        textAlign: 'right',
    },
}))

const StudyDetailPanel = props => {
    const [store, ] = useContext(StoreContext)
    const theme = useTheme()
    const {
        proposalID, shortTitle, piName, submitterInstitution, assignToInstitution,
        therapeuticArea, proposalStatus, fundingAmount, fundingPeriod, fundingStatus, fundingStatusWhenApproved,
        dateSubmitted, meetingDate, fundingStart, plannedGrantSubmissionDate, actualGrantSubmissionDate,
        requestedServices, approvedServices,
    } = props
    const [sites, setSites] = useState(null)
    const classes = useDetailPanelStyles()

    useEffect(() => {
        if (proposalID) {
            const studySites = store.sites.filter(site => site.proposalID == proposalID)
            setSites(studySites)
        }
    }, [props.proposalID])

    const activeSitesCount = () => {
        const reducer = (count, site) => isSiteActive(site) ? count + 1 : count
        return sites.reduce(reducer, 0)
    }

    const activeSitesPercentage = () => 100 * (activeSitesCount() / sites.length).toFixed(2)
    
    const total = property => {
        const reducer = (count, site) => site[property] ? count + parseInt(site[property]) : count
        return sites.reduce(reducer, 0)
    }

    const earliestDate = property => {
        const dates = sites.filter(site => site[property] !== '')
                           .map(site => new Date(site[property]))
        const reducer = (earliest, thisDate) => earliest < thisDate ? earliest : thisDate
        const minDate = dates.reduce(reducer, new Date()) 
        return minDate
    }

    return (
        <section className={ classes.detailPanel }>
            {
                sites ? (
                    <Grid container spacing={ theme.spacing(2) }>
                        <Grid item xs={ 10 }>
                            <Subheading>{ shortTitle } Summary</Subheading>
                        </Grid>
                        <Grid item xs={ 2 } className={ classes.actions }>
                            <Tooltip title="Utah Recommendation" placement="bottom">
                                <IconButton aria-label="View Utah Recommendation" size="large" component={ NavLink } to={ `/studies/${ proposalID }/utah` }>
                                    <UtahIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Detailed Study Report" placement="bottom">
                                <IconButton aria-label="View Detailed Report" size="large" component={ NavLink } to={ `/studies/${ proposalID }/report` }>
                                    <ReportIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid item xs={ 3 }>
                            <Subsubheading align="center">Site Activation</Subsubheading>
                            <SitesActivationPieChart percentage={ activeSitesPercentage() } />
                            <Caption align="center">
                                { activeSitesCount() } of { sites.length } sites
                            </Caption>
                        </Grid>
                        <Grid item xs={ 5 }>
                            <Paragraph>
                                Patient Counts
                            </Paragraph>
                            <ul>
                                <li>Consented: { total('patientsConsentedCount') }</li>
                                <li>Expected: { total('patientsExpectedCount') }</li>
                                <li>Withdrawn: { total('patientsWithdrawnCount') }</li>
                                <li>Enrolled: { total('patientsEnrolledCount') }</li>
                            </ul>
                        </Grid>
                        <Grid item xs={ 4 }>
                            <Paragraph>
                                Notable Dates
                            </Paragraph>
                            <ul>
                                <li>First Activation: { formatDate(earliestDate('dateSiteActivated')) }</li>
                                <li>First IRB Submission: { formatDate(earliestDate('dateIrbSubmission')) }</li>
                                <li>First IRB Approval:  { formatDate(earliestDate('dateIrbApproval')) }</li>
                            </ul>
                        </Grid>
                    </Grid>
                ) : <CircularLoader />
            }
        </section>
    )
}

export const StudiesTable = ({ title, studies, paging }) => {
    const [settings] = useContext(SettingsContext)
    if (title) title += ` (${ studies.length } Studies)`

    return (
        <MaterialTable
            title={ title || '-' }
            components={{ }}
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
                    title: 'Status', field: 'proposalStatus',
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
            ] }
            data={ studies }
            options={{
                paging: paging,
                columnsButton: true,
                exportButton: true,
                filtering: true,
                grouping: true,
                pageSize: settings.tables.pageSize,
                pageSizeOptions: [15, 25, 50, 100, 200],
                exportFileName: title,
                detailPanelType: 'multiple',
            }}
            detailPanel={[
                {
                    tooltip: 'View Report',
                    render: rowData => <StudyDetailPanel { ...rowData } />,
                },
            ]}
            onRowClick={ (event, rowData, togglePanel) => togglePanel() }
        />
    )
}
