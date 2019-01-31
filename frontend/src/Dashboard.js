import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Switch, Route } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { Drawer, Hidden, CssBaseline, Toolbar, IconButton } from '@material-ui/core'
import {
    Menu as MenuIcon,
    Build as BuildIcon,
    Dashboard as DashboardIcon,
    Settings as SettingsIcon,
    Share as ShareIcon,
    Timeline as TimelineIcon,
    ExitToApp as ExitToAppIcon,
    Grade as GradeIcon,
    Description as DescriptionIcon,
    Assessment as AssessmentIcon,
    KeyboardArrowRight as KeyboardArrowRightIcon,
} from '@material-ui/icons'

import { AuthConsumer } from './contexts/AuthContext'

import ScrollToTop from './utils/ScrollToTop'

import SideMenu from './components/Menus/SideMenu'
import UserMenu from './components/Menus/UserMenu'

import HomePage from './views/Index'
import SettingsPage from './views/Settings'
import AllProposals from './views/Proposals.js'
import ProposalsByStage from './views/Reports/ByStage'
import ApprovedProposals from './views/Reports/Approved'
import SubmittedProposals from './views/Reports/Submitted'
import MetricsPage from './views/Metrics'
import CollaborationsPage from './views/Collaborations'

const drawerWidth = 240

const styles = (theme) => ({
    layout: {
        display: 'flex',
    },
    drawerPaper: {
        width: drawerWidth,
        backgroundColor: theme.palette.secondary.light,
        backgroundImage: `linear-gradient(
            135deg,
            ${theme.palette.secondary.light} 25%,
            ${theme.palette.extended.shaleBlue} 25%,
            ${theme.palette.extended.shaleBlue} 50%,
            ${theme.palette.secondary.light} 50%,
            ${theme.palette.secondary.light} 75%,
            ${theme.palette.extended.shaleBlue} 75%,
            ${theme.palette.extended.shaleBlue} 100%
        )`,
        backgroundSize: `5.66px 5.66px`,
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    brand: {
        border: `1px solid ${ theme.palette.primary.dark }`,
        color: theme.palette.primary.dark,
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
        marginTop: theme.spacing.unit,
        marginBottom: 4 * theme.spacing.unit,
        [theme.breakpoints.up('sm')]: {
            marginBottom: 0,
        },
    },
    flexer: { flex: 1, },
    menuButton: {
        marginRight: 20,
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    main: {
        // ...theme.mixins.debug,
        height: '100vh',
        backgroundColor: theme.palette.common.white,
        flexGrow: 1,
        padding: 2 * theme.spacing.unit,
        paddingTop: 0,
        transition: 'padding 250ms',
        [theme.breakpoints.up('sm')]: {
            padding: 4 * theme.spacing.unit,
            paddingTop: 0,
        },
    },
})

class Dashboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            mobileOpen: false,
        }
    }

    // this object is passed to the SideMenu component to build the dashboard's side menu
    sideMenuItems = [
        {
            items: [
                { text: 'Dashboard', icon: <DashboardIcon />, href: '/', },
                { text: 'Proposals', icon: <DescriptionIcon />, href: '/proposals', },
            ],
        },
        {
            items: [
                { text: 'Reports', icon: <AssessmentIcon/>, href: '/reports/proposals',
                    submenu: [
                        { text: 'Approved', path: '/reports/proposals/approved', icon: <KeyboardArrowRightIcon/> },
                        { text: 'Submitted', path: '/reports/proposals/submitted', icon: <KeyboardArrowRightIcon/> },
                        { text: 'By Stage', path: '/reports/proposals/stage', icon: <KeyboardArrowRightIcon/> },
                    ]
                },
                { text: 'Forecasts', icon: <TimelineIcon/>, href: '/reports/forecasts', disabled: true, },
                { text: 'Metrics', icon: <GradeIcon/>, href: '/reports/metrics', },
            ],
        },
        {
            items: [
                { text: 'Collaborations', icon: <ShareIcon />, href: '/analytics/collaborations', },
                { text: 'QueryBuilder', icon: <BuildIcon />, href: '/analytics/query-builder', disabled: true, },
            ],
        },
    ]

    userMenuItems = [
        { text: 'Settings', href: '/settings', icon: <SettingsIcon /> },
        { text: 'Logout', href: '/', icon: <ExitToAppIcon />, },
    ]
    
    handleDrawerToggle = () => {
        this.setState({
            mobileOpen: !this.state.mobileOpen,
        });
    }

    render() {
        const { classes } = this.props
        
        const brand = (
            <div className={ classes.brand }>
                <div style={{ fontSize: '360%', lineHeight: '4rem', }}>Duke</div>
                <div style={{ fontSize: '180%', lineHeight: '2rem', }}>Vanderbilt</div>
                <div style={{ fontSize: '400%', lineHeight: '4rem', }}>TIC</div>
            </div>
        )

        return (
            <AuthConsumer>
                {
                    (context) => {
                        return (
                            <div className={ classes.layout }>
                                <nav className={ classes.drawer }>
                                    <Hidden smUp implementation="css">
                                        <Drawer anchor={ 'left' } variant="temporary"
                                            open={ this.state.mobileOpen } onClose={ this.handleDrawerToggle }
                                            classes={{ paper: classes.drawerPaper, }} container={ this.props.container }
                                            ModalProps={{ keepMounted: true, }} // Better open performance on mobile.
                                        >
                                            <a href="/">{ brand }</a>
                                            <SideMenu menuItems={ this.sideMenuItems }/>
                                        </Drawer>
                                    </Hidden>
                                    <Hidden xsDown implementation="css">
                                        <Drawer open variant="permanent" classes={{ paper: classes.drawerPaper }}>
                                            <a href="/">{ brand }</a>
                                            <SideMenu menuItems={ this.sideMenuItems }/>
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
                                                onClick={ this.handleDrawerToggle }
                                                className={ classes.menuButton }
                                            >
                                                <MenuIcon />
                                            </IconButton>
                                            <div className={ classes.flexer }/>
                                            <UserMenu menuItems={ this.userMenuItems }/>
                                        </Toolbar>
                                        <Switch>
                                            <Route exact path="/settings" component={ SettingsPage }/>
                                            <Route path="/proposals" component={ AllProposals }/>
                                            <Route path="/reports/proposals/approved" component={ ApprovedProposals }/>
                                            <Route path="/reports/proposals/submitted" component={ SubmittedProposals }/>
                                            <Route path="/reports/proposals/stage" component={ ProposalsByStage }/>
                                            <Route path="/reports/metrics" component={ MetricsPage }/>
                                            <Route path="/analytics/collaborations" component={ CollaborationsPage }/>
                                            <Route path="/" component={ HomePage }/>
                                        </Switch>
                                    </ScrollToTop>
                                </main>
                            </div>
                        )
                    }
                }
            </AuthConsumer>
        )
    }
}

Dashboard.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(Dashboard)