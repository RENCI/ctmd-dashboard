import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Switch,  Route } from 'react-router-dom'
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

import { AuthConsumer } from './contexts/AuthContext'

import ScrollToTop from './utils/ScrollToTop'

import Heading from './components/Typography/Heading'
import SideMenu from './components/Menus/SideMenu'
import UserMenu from './components/Menus/UserMenu'

import HomePage from './views/Index'
import SettingsPage from './views/Settings'
import ProposalsByStage from './views/Proposals/ByStage'
import ApprovedProposals from './views/Proposals/Approved'
import SubmittedProposals from './views/Proposals/Submitted'

import ForecastsPage from './views/Forecasts'
import PerformancePage from './views/Performance'
import CollaborationsPage from './views/Analytics/Collaborations'
import QueryBuilderPage from './views/Analytics/QueryBuilder'

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
                    { text: 'Dashboard', icon: <DashboardIcon />, href: '/', },
                ],
            },
            {
                title: 'Reports',
                items: [
                    { text: 'Proposals', icon: <LayersIcon/>, href: '/reports/proposals',
                        submenu: [
                            { text: 'By Stage', path: '/reports/proposals/stage', icon: <KeyboardArrowRightIcon/> },
                            { text: 'Submitted', path: '/reports/proposals/submitted', icon: <KeyboardArrowRightIcon/> },
                            { text: 'Approved', path: '/reports/proposals/approved', icon: <KeyboardArrowRightIcon/> },
                        ]
                    },
                    { text: 'Forecasts', icon: <LayersIcon/>, href: '/reports/forecasts', },
                    { text: 'Performance', icon: <LayersIcon/>, href: '/reports/performance', },
                ],
            },
            {
                title: 'Analytics',
                items: [
                    { text: 'Collaborations', icon: <GroupWorkIcon />, href: '/analytics/collaborations', },
                    { text: 'QueryBuilder', icon: <BuildIcon />, href: '/analytics/query-builder', },
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
                            { text: 'Settings', href: '/settings', icon: <SettingsIcon /> },
                            { text: 'Logout', href: '/login', icon: <ExitToAppIcon />, onClick: context.logout },
                        ]
                        return (
                            <div className={ classes.root }>
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
                                    <ScrollToTop>
                                        <Switch>
                                            <Route exact path="/settings" component={ SettingsPage }/>
                                            <Route path="/reports/proposals/approved" component={ ApprovedProposals }/>
                                            <Route path="/reports/proposals/submitted" component={ SubmittedProposals }/>
                                            <Route path="/reports/proposals/stage" component={ ProposalsByStage }/>
                                            <Route path="/reports/forecasts" component={ ForecastsPage }/>
                                            <Route path="/reports/performance" component={ PerformancePage }/>
                                            <Route path="/analytics/collaborations" component={ CollaborationsPage }/>
                                            <Route path="/analytics/query-builder" component={ QueryBuilderPage }/>
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