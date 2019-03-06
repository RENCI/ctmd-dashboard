import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { NavLink } from 'react-router-dom'
import { MenuList, MenuItem, ListItemIcon, ListItemText } from '@material-ui/core'
import {
    Dashboard as DashboardIcon,
    Description as ProposalsIcon,
    // Assessment as ReportsIcon,
    // Timeline as ForecastsIcon,
    LocalLaundryService as ServicesIcon,
    Star as MetricsIcon,
    LocationOn as SiteReportIcon,
    Share as CollaborationsIcon,
    // Build as QueryBuilderIcon,
} from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
    menuItem: {
        padding: `${ 1.5 * theme.spacing.unit }px ${ 4 * theme.spacing.unit }px`,
        display: 'flex', alignItems: 'center',
        margin: theme.spacing.unit,
        borderRadius: theme.spacing.unit,
        transition: 'background-color 250ms',
        letterSpacing: '1px',
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
        },
    },
    icon: {
        opacity: 0.8,
        padding: 0,
        paddingRight: 2 * theme.spacing.unit,
        fontSize: '250%',
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
        <MenuList>
            <MenuItem component={ NavLink } exact to="/" className={ classes.menuItem } activeClassName={ classes.active }>
                <ListItemIcon><DashboardIcon /></ListItemIcon>
                <ListItemText primary="Dashboard"/>
            </MenuItem>
            <MenuItem component={ NavLink } to="/proposals" className={ classes.menuItem } activeClassName={ classes.active }>
                <ListItemIcon><ProposalsIcon /></ListItemIcon>
                <ListItemText primary="Proposals"/>
            </MenuItem>
            <MenuItem component={ NavLink } to="/services" className={ classes.menuItem } activeClassName={ classes.active }>
                <ListItemIcon><ServicesIcon /></ListItemIcon>
                <ListItemText primary="Services"/>
            </MenuItem>
            <MenuItem component={ NavLink } to="/collaborations" className={ classes.menuItem } activeClassName={ classes.active }>
                <ListItemIcon><CollaborationsIcon /></ListItemIcon>
                <ListItemText primary="Collaborations"/>
            </MenuItem>
        </MenuList>
    )
}

export default Menu
