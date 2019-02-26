import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { NavLink } from 'react-router-dom'
import { MenuList, MenuItem, ListItemIcon, ListItemText } from '@material-ui/core'
import {
    Dashboard as DashboardIcon,
    Description as ProposalsIcon,
    Assessment as ReportsIcon,
    Timeline as ForecastsIcon,
    Star as MetricsIcon,
    LocationOn as SiteReportIcon,
    Share as CollaborationsIcon,
    Build as QueryBuilderIcon,
} from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
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
            <MenuItem component={ NavLink } exact to="/" activeClassName={ classes.active }>
                <ListItemIcon><DashboardIcon /></ListItemIcon>
                <ListItemText primary="Dashboard"/>
            </MenuItem>
            <MenuItem component={ NavLink } to="/proposals" activeClassName={ classes.active }>
                <ListItemIcon><ProposalsIcon /></ListItemIcon>
                <ListItemText primary="Proposals"/>
            </MenuItem>
            <MenuItem component={ NavLink } to="/reports" activeClassName={ classes.active }>
                <ListItemIcon><ReportsIcon /></ListItemIcon>
                <ListItemText primary="Reports"/>
            </MenuItem>
            <MenuItem component={ NavLink } to="/forecasts" activeClassName={ classes.active }>
                <ListItemIcon><ForecastsIcon /></ListItemIcon>
                <ListItemText primary="Forecasts"/>
            </MenuItem>
            <MenuItem component={ NavLink } to="/site-report" activeClassName={ classes.active }>
                <ListItemIcon><SiteReportIcon /></ListItemIcon>
                <ListItemText primary="Site Report"/>
            </MenuItem>
            <MenuItem component={ NavLink } to="/study-metrics" activeClassName={ classes.active }>
                <ListItemIcon><MetricsIcon /></ListItemIcon>
                <ListItemText primary="Study Metrics"/>
            </MenuItem>
            <MenuItem component={ NavLink } to="/collaborations" activeClassName={ classes.active }>
                <ListItemIcon><CollaborationsIcon /></ListItemIcon>
                <ListItemText primary="Collaborations"/>
            </MenuItem>
            <MenuItem component={ NavLink } to="/query-builder" icon activeClassName={ classes.active }>
                <ListItemIcon><QueryBuilderIcon /></ListItemIcon>
                <ListItemText primary="Query Builder"/>
            </MenuItem>
        </MenuList>
    )
}

export default Menu
