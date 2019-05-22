import React, { useState } from 'react'
import { Switch, Route } from 'react-router-dom'
import { makeStyles } from '@material-ui/styles'
import { CssBaseline, IconButton } from '@material-ui/core'
import { Menu as MenuIcon } from '@material-ui/icons'

import ScrollToTop from './utils/ScrollToTop'
import MenuTray from './components/Menus/MainMenu/Tray'
import HomePage from './views/Index'
import SettingsPage from './views/Settings'
import ProposalPage from './views/ProposalInspector'
import ProposalsPage from './views/Proposals'
import ProposalsByOrganization from './views/Proposals/ByOrganization'
import ProposalsByTic from './views/Proposals/ByTic'
import ProposalsByStatus from './views/Proposals/ByStatus'
import ProposalsByTherapeuticArea from './views/Proposals/ByTherapeuticArea'
import ProposalsByDate from './views/Proposals/ByDate'
import ProposalsByApprovedServices from './views/Proposals/ByApprovedServices'
import ProposalsByRequestedServices from './views/Proposals/ByRequestedServices'
import StudyMetricsPage from './views/StudyMetrics'
import SiteReportsPage from './views/SiteReports/SiteReports'
import StudiesPage from './views/SiteReports/Studies'
import CollaborationsPage from './views/Collaborations'

const useStyles = makeStyles(theme => ({
    layout: {
        display: 'flex',
        backgroundColor: `${ theme.palette.primary.main }11`,
    },
    menuToggleButton: {
        transform: 'translateX(0)',
        transition: 'transform 250ms, opacity 500ms',
        transitionDelay: '500ms',
        opacity: 0.75,
        position: 'absolute',
        left: '0.5rem',
        top: '0.5rem',
        [theme.breakpoints.up('sm')]: {
            transform: 'translateX(-150%)',
            opacity: 0,
        },
    },
    main: {
        minHeight: '100vh',
        flexGrow: 1,
        padding: `${ 4 * theme.spacing.unit }px`,
        marginLeft: '5rem',
        transition: 'padding-top 250ms',
    },
}))

const Dashboard = props => {
    const classes = useStyles()
    const [mobileOpen, setMobileOpen] = useState()
    
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    return (
        <div className={ classes.layout }>
            <MenuTray />
            <main className={ classes.main }>
                <CssBaseline />
                <ScrollToTop>
                    <Switch>
                        <Route exact path="/settings" component={ SettingsPage }/>
                        <Route exact path="/proposals/:id(\d+)" component={ ProposalPage }/>
                        <Route exact path="/proposals" component={ ProposalsPage }/>
                        <Route path="/proposals/organization" component={ ProposalsByOrganization }/>
                        <Route path="/proposals/tic" component={ ProposalsByTic }/>
                        <Route path="/proposals/status" component={ ProposalsByStatus }/>
                        <Route path="/proposals/therapeutic-area" component={ ProposalsByTherapeuticArea }/>
                        <Route path="/proposals/date" component={ ProposalsByDate }/>
                        <Route path="/proposals/requested-services" component={ ProposalsByRequestedServices }/>
                        <Route path="/proposals/approved-services" component={ ProposalsByApprovedServices }/>
                        <Route path="/collaborations" component={ CollaborationsPage }/>
                        <Route path="/site-reports/:id(\d+)" component={ SiteReportsPage }/>
                        <Route path="/site-reports" component={ StudiesPage }/>
                        <Route path="/study-metrics" component={ StudyMetricsPage }/>
                        <Route path="/" component={ HomePage }/>
                    </Switch>
                </ScrollToTop>
            </main>
        </div>
    )
}

export default Dashboard