import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { NavLink } from 'react-router-dom'
import { MenuList, MenuItem, ListItemIcon, ListItemText } from '@material-ui/core'
import {
    Dashboard as DashboardIcon,
    Description as ProposalsIcon,
    // Assessment as ReportsIcon,
    // Timeline as ForecastsIcon,
    Star as MetricsIcon,
    LocationOn as SiteReportIcon,
    Share as CollaborationsIcon,
    // Build as QueryBuilderIcon,
    Settings as SettingsIcon,
    // ExitToApp as LogoutIcon,
} from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
    menuList: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    flexer: {
        flex: 1,
    },
    menuItem: {
        padding: `${ 1 * theme.spacing.unit }px ${ 1 * theme.spacing.unit }px`,
        display: 'flex', alignItems: 'center',
        margin: `${theme.spacing.unit / 4}px ${ theme.spacing.unit }px`,
        borderRadius: theme.spacing.unit,
        transition: 'background-color 250ms',
        letterSpacing: '1px',
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
        },
    },
    listItemText: {
        padding: 0,
    },
    icon: {
        opacity: 0.8,
        fontSize: '200%',
    },
    active: {
        backgroundColor: theme.palette.grey[300],
        color: theme.palette.common.white,
        '&:focus': {
            backgroundColor: theme.palette.grey[300],
        },
        '&:hover': {
            backgroundColor: theme.palette.grey[300],
        },
    },
}))

const Menu = props => {
    const classes = useStyles()
    return (
        <MenuList className={ classes.menuList }>
            <MenuItem component={ NavLink } exact to="/" className={ classes.menuItem } activeClassName={ classes.active }>
                <ListItemIcon className={ classes.icon }><DashboardIcon /></ListItemIcon>
                <ListItemText primary="Home" classes={{ root: classes.listItemText }}/>
            </MenuItem>
            <MenuItem component={ NavLink } to="/proposals" className={ classes.menuItem } activeClassName={ classes.active }>
                <ListItemIcon className={ classes.icon }><ProposalsIcon /></ListItemIcon>
                <ListItemText primary="Proposals" classes={{ root: classes.listItemText }}/>
            </MenuItem>
            <MenuItem component={ NavLink } to="/collaborations" className={ classes.menuItem } activeClassName={ classes.active }>
                <ListItemIcon className={ classes.icon }><CollaborationsIcon /></ListItemIcon>
                <ListItemText primary="Collaborations" classes={{ root: classes.listItemText }}/>
            </MenuItem>
            <MenuItem component={ NavLink } to="/study-metrics" className={ classes.menuItem } activeClassName={ classes.active }>
                <ListItemIcon className={ classes.icon }><MetricsIcon /></ListItemIcon>
                <ListItemText primary="Study Metrics" classes={{ root: classes.listItemText }}/>
            </MenuItem>
            <MenuItem component={ NavLink } to="/site-reports" className={ classes.menuItem } activeClassName={ classes.active }>
                <ListItemIcon className={ classes.icon }><SiteReportIcon /></ListItemIcon>
                <ListItemText primary="Site Report" classes={{ root: classes.listItemText }}/>
            </MenuItem>

            <div className={ classes.flexer } style={{ pointerEvents: 'none', }}/>

            <MenuItem button component={ NavLink } to={ '/settings' } className={ classes.menuItem } activeClassName={ classes.active }>
                <ListItemIcon>{ <SettingsIcon /> }</ListItemIcon>
                <ListItemText primary="Settings"  classes={{ primary: classes.listItemText }}/>
            </MenuItem>
        </MenuList>
    )
}

export default Menu
