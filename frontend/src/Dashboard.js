import React, { useState } from 'react'
import { Switch, Route } from 'react-router-dom'
import { makeStyles } from '@material-ui/styles'
import { Drawer, Hidden, CssBaseline, Toolbar, IconButton } from '@material-ui/core'
import {
    Menu as MenuIcon,
    Settings as SettingsIcon,
    ExitToApp as LogoutIcon,
} from '@material-ui/icons'

import ScrollToTop from './utils/ScrollToTop'

import SideMenu from './components/Menus/SideMenu'
import UserMenu from './components/Menus/UserMenu'

import HomePage from './views/Index'
import SettingsPage from './views/Settings'
import ProposalsPage from './views/Proposals'
import ProposalsByOrganization from './views/Proposals/ByOrganization'
import ProposalsByTic from './views/Proposals/ByTic'
import ProposalsByStatus from './views/Proposals/ByStatus'
import ProposalsByTherapeuticArea from './views/Proposals/ByTherapeuticArea'
import ProposalsByDate from './views/Proposals/ByDate'
import ProposalsByApprovedServices from './views/Proposals/ByApprovedServices'
import ProposalsByRequestedServices from './views/Proposals/ByRequestedServices'
import StudyMetricsPage from './views/StudyMetrics'
import SiteReportPage from './views/SiteReport'
import CollaborationsPage from './views/Collaborations'

const drawerWidth = 240

const useStyles = makeStyles(theme => ({
    layout: { display: 'flex', },
    drawerPaper: { width: drawerWidth, },
    nav: {
        minWidth: 0,
        transition: 'min-width 250ms',
        [theme.breakpoints.up('sm')]: {
            minWidth: drawerWidth,
            flexShrink: 0,
        },
    },
    brand: {
        backgroundColor: 'transparent',
        border: `1px solid ${ theme.palette.primary.light }`,
        color: theme.palette.primary.light,
        fontFamily: 'EB Garamond',
        textAlign: 'center',
        padding: `${2 * theme.spacing.unit }px 0`,
        margin: 4 * theme.spacing.unit,
        borderTopLeftRadius: 2 * theme.spacing.unit,
        borderBottomRightRadius: 2 * theme.spacing.unit,
        transition: 'background-color 250ms',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
        }
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
        backgroundColor: theme.palette.extended.limestone,
        flexGrow: 1,
        padding: `${ 4 * theme.spacing.unit }px`,
        paddingTop: `${ 8 * theme.spacing.unit }px`,
        transition: 'padding-top 250ms',
        [theme.breakpoints.up('sm')]: {
            padding: `${ 4 * theme.spacing.unit }px`,
            paddingTop: `${ 5 * theme.spacing.unit }px`,
        },
    },
}))

const Dashboard = props => {
    const classes = useStyles()
    const [mobileOpen, setMobileOpen] = useState()

    
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    const brand = (
        <div className={ classes.brand }>
            <div style={{ fontSize: '360%', lineHeight: '4rem', }}>Duke</div>
            <div style={{ fontSize: '180%', lineHeight: '2rem', }}>Vanderbilt</div>
            <div style={{ fontSize: '400%', lineHeight: '4rem', }}>TIC</div>
        </div>
    )

    return (
        <div className={ classes.layout }>
            <nav className={ classes.nav }>
                <Hidden smUp implementation="css">
                    <Drawer anchor={ 'left' } variant="temporary"
                        open={ mobileOpen } onClose={ handleDrawerToggle }
                        classes={{ paper: classes.drawerPaper, }} container={ props.container }
                        ModalProps={{ keepMounted: true, }} // Better open performance on mobile.
                    >
                        <a href="/">{ brand }</a>
                        <SideMenu />
                    </Drawer>
                </Hidden>
                <Hidden xsDown implementation="css">
                    <Drawer open variant="permanent" classes={{ paper: classes.drawerPaper }}>
                        <a href="/">{ brand }</a>
                        <SideMenu />
                    </Drawer>
                </Hidden>
            </nav>
            <main className={ classes.main }>
                <CssBaseline />
                <ScrollToTop>
                    <IconButton
                        color="default"
                        aria-label="Open drawer"
                        onClick={ handleDrawerToggle }
                        className={ classes.menuToggleButton }
                    ><MenuIcon fontSize="large" /></IconButton>
                    <Switch>
                        <Route exact path="/settings" component={ SettingsPage }/>
                        <Route exact path="/proposals" component={ ProposalsPage }/>
                        <Route path="/proposals/organization" component={ ProposalsByOrganization }/>
                        <Route path="/proposals/tic" component={ ProposalsByTic }/>
                        <Route path="/proposals/status" component={ ProposalsByStatus }/>
                        <Route path="/proposals/therapeutic-area" component={ ProposalsByTherapeuticArea }/>
                        <Route path="/proposals/date" component={ ProposalsByDate }/>
                        <Route path="/proposals/requested-services" component={ ProposalsByRequestedServices }/>
                        <Route path="/proposals/approved-services" component={ ProposalsByApprovedServices }/>
                        <Route path="/collaborations" component={ CollaborationsPage }/>
                        <Route path="/site-report" component={ SiteReportPage }/>
                        <Route path="/study-metrics" component={ StudyMetricsPage }/>
                        <Route path="/" component={ HomePage }/>
                    </Switch>
                </ScrollToTop>
            </main>
        </div>
    )
}

export default Dashboard