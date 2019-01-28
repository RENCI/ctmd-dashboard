import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Switch,  Route } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { Drawer, Hidden, CssBaseline, Toolbar, IconButton } from '@material-ui/core'
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
    layout: {
        display: 'flex',
    },
    drawerPaper: {
        width: drawerWidth,
        backgroundColor: theme.palette.secondary.light,
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.common.white,
        padding: '3rem',
        textAlign: 'center',
        color: theme.palette.extended.limestone,
        fontFamily: 'EB Garamond',
        fontSize: '200%',
    },
    toolbar: {
        ...theme.mixins.debug,
        display: 'flex',
        flexDirection: 'row',
        padding: 0,
        margin: 0,
        transition: 'margin-bottom 250ms',
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
        
        const brand = (
            <div className={ classes.brand }>
                Duke<br/>
                Vanderbilt<br/>
                TIC
            </div>
        )

        return (
            <AuthConsumer>
                {
                    (context) => {
                        const userMenuItems = [
                            { text: 'Settings', href: '/settings', icon: <SettingsIcon /> },
                            { text: 'Logout', href: '/login', icon: <ExitToAppIcon />, onClick: context.logout },
                        ]
                        return (
                            <div className={ classes.layout }>
                                <nav className={ classes.drawer }>
                                    <Hidden smUp implementation="css">
                                        <Drawer anchor={ 'left' } variant="temporary"
                                            open={ this.state.mobileOpen } onClose={ this.handleDrawerToggle }
                                            classes={{ paper: classes.drawerPaper, }} container={ this.props.container }
                                            ModalProps={{ keepMounted: true, }} // Better open performance on mobile.
                                        >
                                            { brand }
                                            <SideMenu menuItems={ this.menuItems }/>
                                        </Drawer>
                                    </Hidden>
                                    <Hidden xsDown implementation="css">
                                        <Drawer open variant="permanent" classes={{ paper: classes.drawerPaper }}>
                                            { brand }
                                            <SideMenu menuItems={ this.menuItems }/>
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
                                            <div className={ classes.flexer }>&nbsp;</div>
                                            { context.authenticated === true ? <UserMenu menuItems={ userMenuItems }/> : null }
                                        </Toolbar>
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