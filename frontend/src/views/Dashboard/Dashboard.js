import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Switch, Route } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { Drawer, Hidden, CssBaseline, AppBar, Toolbar, IconButton } from '@material-ui/core'
import {
    Menu as MenuIcon,
    Build as BuildIcon,
    Dashboard as DashboardIcon,
    Layers as LayersIcon,
    Settings as SettingsIcon,
    GroupWork as GroupWorkIcon,
    ExitToApp as ExitToAppIcon,
    KeyboardArrowRight as KeyboardArrowRightIcon,
} from '@material-ui/icons'

import Heading from '../../components/Typography/Heading'
import SideMenu from './Menus/SideMenu'
import UserMenu from './Menus/UserMenu'

import { AuthConsumer } from '../../contexts/AuthContext'

import HomePage from './Index'
import SettingsPage from './Settings'
import ProposalsIndex from './Proposals/Index'
import ProposalsByStage from './Proposals/ByStage'
import ProposalsByApproval from './Proposals/ByApproval'
import ProposalsBySubmission from './Proposals/BySubmission'
import ForecastsPage from './Forecasts'
import PerformancePage from './Performance'

import CollaborationsPage from './Analytics/Collaborations'
import QueryBuilderPage from './Analytics/QueryBuilder'

const drawerWidth = 240

const styles = (theme) => ({
    root: {
        display: 'flex',
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    appBar: {
        marginLeft: drawerWidth,
        [theme.breakpoints.up('sm')]: {
            maxWidth: `calc(100% - ${ drawerWidth }px)`,
        },
    },
    toolbar: {
        display: 'flex',
        paddingRight: 24,
        ...theme.mixins.toolbar
    },
    menuButton: {
        marginRight: 20,
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    heading: {
        color: theme.palette.common.white,
        flex: 1,
    },
    drawerPaper: {
        width: drawerWidth,
        backgroundColor: theme.palette.common.white,
    },
    main: {
        flexGrow: 1,
        padding: theme.spacing.unit * 3,
    },
})

class Dashboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            mobileOpen: false,
        }
        this.menuItems = [
            {
                title: '',
                items: [
                    { text: 'Dashboard', icon: <DashboardIcon />, href: '/dashboard', },
                ],
            },
            {
                title: 'Reports',
                items: [
                    { text: 'Proposals', icon: <LayersIcon/>, href: '/dashboard/reports/proposals',
                        submenu: [
                            { text: 'By Stage', path: '/dashboard/reports/proposals/stage', icon: <KeyboardArrowRightIcon/> },
                            { text: 'By Submission', path: '/dashboard/reports/proposals/submission', icon: <KeyboardArrowRightIcon/> },
                            { text: 'By Approval', path: '/dashboard/reports/proposals/approval', icon: <KeyboardArrowRightIcon/> },
                        ]
                    },
                    { text: 'Forecasts', icon: <LayersIcon/>, href: '/dashboard/reports/forecasts', },
                    { text: 'Performance', icon: <LayersIcon/>, href: '/dashboard/reports/performance', },
                ],
            },
            {
                title: 'Analytics',
                items: [
                    { text: 'Collaborations', icon: <GroupWorkIcon />, href: '/dashboard/analytics/collaborations', },
                    { text: 'QueryBuilder', icon: <BuildIcon />, href: '/dashboard/analytics/query-builder', },
                ],
            },
            {
                title: '',
                items: [
                    { text: 'Exit', icon: <ExitToAppIcon />, href: '/home', },
                ],
            },
        ]
    }
    
    handleDrawerToggle = () => {
        this.setState({
            mobileOpen: !this.state.mobileOpen,
        });
    }

    render() {
        const { classes } = this.props
        return (
            <AuthConsumer>
                {
                    (context) => {
                        const userMenuItems = [
                            { text: 'Settings', href: '/dashboard/settings', icon: <SettingsIcon />},
                            { text: 'Logout', href: '/dashboard/logout', icon: <ExitToAppIcon />, onClick: context.logout },
                        ]
                        return <div className={ classes.root }>
                            <CssBaseline />
                            <AppBar position="fixed" className={ classes.appBar }>
                                <Toolbar className={ classes.toolbar }>
                                    <IconButton
                                        color="inherit"
                                        aria-label="Open drawer"
                                        onClick={ this.handleDrawerToggle }
                                        className={ classes.menuButton }
                                    >
                                        <MenuIcon />
                                    </IconButton>
                                    <Heading className={ classes.heading }>
                                        Duke/Vanderbilt TIC Dashboard
                                    </Heading>
                                    {
                                        context.authenticated === true
                                        ? <UserMenu menuItems={ userMenuItems }/>
                                        : null
                                    }
                                </Toolbar>
                            </AppBar>
                            <nav className={ classes.drawer }>
                                <Hidden smUp implementation="css">
                                    <Drawer
                                        container={ this.props.container }
                                        variant="temporary"
                                        anchor={ 'left' }
                                        open={ this.state.mobileOpen }
                                        onClose={ this.handleDrawerToggle }
                                        classes={{
                                            paper: classes.drawerPaper,
                                        }}
                                        ModalProps={{
                                            keepMounted: true, // Better open performance on mobile.
                                        }}
                                    >
                                        <SideMenu menuItems={ this.menuItems }/>
                                    </Drawer>
                                </Hidden>
                                <Hidden xsDown implementation="css">
                                    <Drawer
                                        classes={{ paper: classes.drawerPaper }}
                                        variant="permanent"
                                        open
                                    >
                                        <SideMenu menuItems={ this.menuItems }/>
                                    </Drawer>
                                </Hidden>
                            </nav>
                            <main className={ classes.main }>
                                <div className={ classes.toolbar } />
                                <Switch>
                                    <Route exact path="/dashboard/settings" component={ SettingsPage }/>
                                    <Route path="/dashboard/reports/proposals/approval" component={ ProposalsByApproval }/>
                                    <Route path="/dashboard/reports/proposals/submission" component={ ProposalsBySubmission }/>
                                    <Route path="/dashboard/reports/proposals/stage" component={ ProposalsByStage }/>
                                    <Route path="/dashboard/reports/proposals" component={ ProposalsIndex }/>
                                    <Route path="/dashboard/reports/forecasts" component={ ForecastsPage }/>
                                    <Route path="/dashboard/reports/performance" component={ PerformancePage }/>
                                    <Route path="/dashboard/analytics/collaborations" component={ CollaborationsPage }/>
                                    <Route path="/dashboard/analytics/query-builder" component={ QueryBuilderPage }/>
                                    <Route path="/" component={ HomePage }/>
                                </Switch>
                            </main>
                        </div>
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