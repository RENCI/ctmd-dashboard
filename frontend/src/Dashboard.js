import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Switch,  Route } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { Drawer, Hidden, CssBaseline, AppBar, Toolbar, IconButton } from '@material-ui/core'
import {
    Menu as MenuIcon,
    Build as BuildIcon,
    Dashboard as DashboardIcon,
    Settings as SettingsIcon,
    Share as ShareIcon,
    HourglassFull as HourglassFullIcon,
    ExitToApp as ExitToAppIcon,
    Grade as GradeIcon,
    Description as DescriptionIcon,
    Assessment as AssessmentIcon,
    KeyboardArrowRight as KeyboardArrowRightIcon,
} from '@material-ui/icons'

import { AuthConsumer } from './contexts/AuthContext'

import ScrollToTop from './utils/ScrollToTop'

import Heading from './components/Typography/Heading'
import Subheading from './components/Typography/Subheading'
import SideMenu from './components/Menus/SideMenu'
import UserMenu from './components/Menus/UserMenu'

import HomePage from './views/Index'
import SettingsPage from './views/Settings'
import AllProposals from './views/Proposals/All'
import ProposalsByStage from './views/Proposals/ByStage'
import ApprovedProposals from './views/Proposals/Approved'
import SubmittedProposals from './views/Proposals/Submitted'
import CollaborationsPage from './views/Analytics/Collaborations'

const drawerWidth = 240

const styles = (theme) => ({
    root: {
        display: 'flex',
    },
    drawerPaper: {
        width: drawerWidth,
        backgroundColor: theme.palette.primary.main,
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    main: {
        flexGrow: 1,
        padding: 2 * theme.spacing.unit,
        paddingTop: 18 * theme.spacing.unit,
        transition: 'padding-top 250ms',
        backgroundColor: theme.palette.common.white,
        [theme.breakpoints.up('sm')]: {
            padding: 4 * theme.spacing.unit,
            paddingTop: 20 * theme.spacing.unit,
        },
    },
    appBar: {
        ...theme.mixins.debug,
        backgroundColor: theme.palette.common.white,
        padding: `${ 4 * theme.spacing.unit }px 0`,
        marginLeft: drawerWidth,
        [theme.breakpoints.up('sm')]: {
            maxWidth: `calc(100% - ${ drawerWidth }px)`,
        },
    },
    toolbar: {
        display: 'flex',
        paddingRight: 24,
        // backgroundImage: `linear-gradient(${ theme.palette.secondary.main }, ${ theme.palette.primary.main })`,
    },
    heading: {
        color: theme.palette.primary.main,
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing.unit,
        transition: 'padding 250ms',
        [theme.breakpoints.up('sm')]: {
            padding: 2 * theme.spacing.unit,
        },
    },
    menuButton: {
        marginRight: 20,
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
})
class Dashboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            mobileOpen: false,
        }
        // this object is passed to the SideMenu component to build the dashboard's side menu
        this.menuItems = [
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
                    { text: 'Forecasts', icon: <HourglassFullIcon/>, href: '/reports/forecasts', disabled: true, },
                    { text: 'Performance', icon: <GradeIcon/>, href: '/reports/performance', disabled: true, },
                ],
            },
            {
                items: [
                    { text: 'Collaborations', icon: <ShareIcon />, href: '/analytics/collaborations', },
                    { text: 'QueryBuilder', icon: <BuildIcon />, href: '/analytics/query-builder', disabled: true, },
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
                                <AppBar position="absolute" elevation={ 0 } className={ classes.appBar }>
                                    <Toolbar className={ classes.toolbar }>
                                        <IconButton
                                            color="inherit"
                                            aria-label="Open drawer"
                                            onClick={ this.handleDrawerToggle }
                                            className={ classes.menuButton }
                                        >
                                            <MenuIcon />
                                        </IconButton>
                                        <Heading className={ classes.heading }>Duke/Vanderbilt TIC Dashboard</Heading>
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
                                            
                                            <Route path="/proposals" component={ AllProposals }/>
                                            
                                            <Route path="/reports/proposals/approved" component={ ApprovedProposals }/>
                                            <Route path="/reports/proposals/submitted" component={ SubmittedProposals }/>
                                            <Route path="/reports/proposals/stage" component={ ProposalsByStage }/>
                                            
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