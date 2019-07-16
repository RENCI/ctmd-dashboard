import React, { Fragment, useState, useContext, useEffect } from 'react'
import { makeStyles, useTheme } from '@material-ui/styles'
import { Grid, Typography, List, Tooltip, ListItemIcon, ListItem, ListItemText, Chip, IconButton, Divider } from '@material-ui/core'
import { Collapse } from '@material-ui/core'
import {
    AccountBox as PiIcon,
    CalendarToday as CalendarIcon,
    AccountBalance as InstitutionIcon,
    LocalOffer as TherapeuticAreaIcon,
    Assignment as TicIcon,
    Alarm as ProposalStatusIcon,
    AttachMoney as BudgetIcon,
    LocalLaundryService as ServicesIcon,
    CheckCircle as ApprovedIcon,
} from '@material-ui/icons'
import { Subheading, Subsubheading, Paragraph, Caption } from '../../../components/Typography'
import { Star as MetricsIcon } from '@material-ui/icons'
import { DetailPanel } from './DetailPanel'

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

const useStyles = makeStyles(theme => ({
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

export const SiteDetailPanel = ({
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
    const classes = useStyles()

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
        <DetailPanel heading={ siteName } subheading="Metrics Report">

            <Grid container>
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

        </DetailPanel>
    )
}
