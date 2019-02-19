import React, { useState } from 'react'
import { Switch, Route } from 'react-router-dom'
import { makeStyles } from '@material-ui/styles'
import { Drawer, Hidden, CssBaseline, Toolbar, IconButton } from '@material-ui/core'
import {
    Menu as MenuIcon,
    Build as QueryBuilderIcon,
    Dashboard as DashboardIcon,
    Settings as SettingsIcon,
    Share as CollaborationsIcon,
    Timeline as ForecastsIcon,
    ExitToApp as LogoutIcon,
    Assessment as ProposalsIcon,
    KeyboardArrowRight as SubItemIcon,
    LocationOn as SiteReportIcon,
    Star as MetricsIcon
} from '@material-ui/icons'

import ScrollToTop from './utils/ScrollToTop'

import SideMenu from './components/Menus/SideMenu'
import UserMenu from './components/Menus/UserMenu'

import HomePage from './views/Index'
import SettingsPage from './views/Settings'
import ProposalsAll from './views/Proposals/All'
import ProposalsByOrganization from './views/Proposals/ByOrganization'
import ProposalsByTic from './views/Proposals/ByTic'
import ProposalsByStatus from './views/Proposals/ByStatus'
import ProposalsByTherapeuticArea from './views/Proposals/ByTherapeuticArea'
import ProposalsByDate from './views/Proposals/ByDate'
import ProposalsResubmitted from './views/Proposals/Resubmitted'
import ProposalsSubmittedForServices from './views/Proposals/SubmittedForServices'
import SiteReportPage from './views/SiteReport'
import StudyMetricsPage from './views/StudyMetrics'
import CollaborationsPage from './views/Collaborations'

const drawerWidth = 300

const useStyles = makeStyles(theme => ({
    layout: {
        display: 'flex',
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    brand: {
        border: `1px solid ${ theme.palette.extended.shaleBlue }`,
        color: theme.palette.extended.shaleBlue,
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
    toolbar: {
        display: 'flex',
        flexDirection: 'row',
        padding: 0,
        margin: 0,
        transition: 'margin-bottom 250ms',
        marginBottom: 4 * theme.spacing.unit,
    },
    flexer: { flex: 1, },
    menuButton: {
        marginRight: 20,
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    main: {
        minHeight: '100vh',
        backgroundColor: theme.palette.extended.limestone,
        flexGrow: 1,
        padding: 2 * theme.spacing.unit,
        paddingTop: 0,
        transition: 'padding 250ms',
        [theme.breakpoints.up('sm')]: {
            padding: 4 * theme.spacing.unit,
            paddingTop: 0,
        },
    },
}))

const Dashboard = props => {
    const classes = useStyles()
    const [mobileOpen, setMobileOpen] = useState()

    // this object is passed to the SideMenu component to build the dashboard's side menu
    const sideMenuItems = [
        {
            items: [
                { text: 'Dashboard', icon: <DashboardIcon />, href: '/', },
            ],
        },
        {
            items: [
                { text: 'Proposals', icon: <ProposalsIcon/>, href: '/proposals',
                    submenu: [
                        { text: 'All', path: '/proposals', icon: <SubItemIcon />, },
                        { text: 'By Organization', path: '/proposals/organization', icon: <SubItemIcon/> },
                        { text: 'By TIC/RIC', path: '/proposals/tic', icon: <SubItemIcon/> },
                        { text: 'By Status', path: '/proposals/status', icon: <SubItemIcon/> },
                        { text: 'By Domain', path: '/proposals/therapeutic-area', icon: <SubItemIcon/> },
                        { text: 'By Date', path: '/proposals/date', icon: <SubItemIcon/> },
                        { text: 'Submitted For Services', path: '/proposals/submitted-for-services', icon: <SubItemIcon/> },
                        { text: 'Resubmissions', path: '/proposals/resubmissions', icon: <SubItemIcon/> },
                    ]
                },
                { text: 'Forecasts', icon: <ForecastsIcon/>, href: '/forecasts', disabled: true, },
                { text: 'Site Report', icon: <SiteReportIcon/>, href: '/site-report', },
                { text: 'Study Metrics', icon: <MetricsIcon/>, href: '/study-metrics', },
            ],
        },
        {
            items: [
                { text: 'Collaborations', icon: <CollaborationsIcon />, href: '/analytics/collaborations', },
                { text: 'QueryBuilder', icon: <QueryBuilderIcon />, href: '/analytics/query-builder', disabled: true, },
            ],
        },
    ]

    const userMenuItems = [
        { text: 'Settings', href: '/settings', icon: <SettingsIcon /> },
        { text: 'Logout', href: '/', icon: <LogoutIcon />, },
    ]
    
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
            <nav className={ classes.drawer }>
                <Hidden smUp implementation="css">
                    <Drawer anchor={ 'left' } variant="temporary"
                        open={ mobileOpen } onClose={ handleDrawerToggle }
                        classes={{ paper: classes.drawerPaper, }} container={ props.container }
                        ModalProps={{ keepMounted: true, }} // Better open performance on mobile.
                    >
                        <a href="/">{ brand }</a>
                        <SideMenu menuItems={ sideMenuItems }/>
                    </Drawer>
                </Hidden>
                <Hidden xsDown implementation="css">
                    <Drawer open variant="permanent" classes={{ paper: classes.drawerPaper }}>
                        <a href="/">{ brand }</a>
                        <SideMenu menuItems={ sideMenuItems }/>
                    </Drawer>
                </Hidden>
            </nav>
            <main className={ classes.main }>
                <CssBaseline />
                <ScrollToTop>
                    <Toolbar className={ classes.toolbar }>
                        <IconButton
                            color="inherit"
                            aria-label="Open drawer"
                            onClick={ handleDrawerToggle }
                            className={ classes.menuButton }
                        >
                            <MenuIcon />
                        </IconButton>
                        <div className={ classes.flexer }/>
                        <UserMenu menuItems={ userMenuItems }/>
                    </Toolbar>
                    <Switch>
                        <Route exact path="/settings" component={ SettingsPage }/>
                        <Route exact path="/proposals" component={ ProposalsAll }/>
                        <Route path="/proposals/organization" component={ ProposalsByOrganization }/>
                        <Route path="/proposals/tic" component={ ProposalsByTic }/>
                        <Route path="/proposals/status" component={ ProposalsByStatus }/>
                        <Route path="/proposals/therapeutic-area" component={ ProposalsByTherapeuticArea }/>
                        <Route path="/proposals/date" component={ ProposalsByDate }/>
                        <Route path="/proposals/submitted-for-services" component={ ProposalsSubmittedForServices }/>
                        <Route path="/proposals/resubmissions" component={ ProposalsResubmitted }/>
                        <Route path="/site-report" component={ SiteReportPage }/>
                        <Route path="/study-metrics" component={ StudyMetricsPage }/>
                        <Route path="/analytics/collaborations" component={ CollaborationsPage }/>
                        <Route path="/" component={ HomePage }/>
                    </Switch>
                </ScrollToTop>
            </main>
        </div>
    )
}

export default Dashboard