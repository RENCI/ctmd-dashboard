import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { NavLink } from 'react-router-dom'
import { MenuList, MenuItem, ListItemIcon, ListItemText, IconButton, Tooltip } from '@material-ui/core'
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
    sidebar: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
    },
    menuList: { },
    flexer: { flex: 1, },
    menuItem: {
        padding: theme.spacing.unit,
        display: 'flex',
        alignItems: 'center',
        margin: `${theme.spacing.unit / 4}px ${ theme.spacing.unit }px`,
        borderRadius: theme.shape.borderRadius,
        transition: 'background-color 250ms',
        letterSpacing: '1px',
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
            '& $listItemIcon': {
                transform: 'scale(1.1)',
            }
        },
    },
    listItemIcon: {
        opacity: 0.8,
        fontSize: '200%',
        transform: 'scale(1)',
        transition: 'transform 250ms',
    },
    listItemText: {
        padding: 0,
        color: theme.palette.grey[600],
    },
    active: {
        backgroundColor: theme.palette.grey[300],
        color: theme.palette.common.white,
        '& $listItemIcon': {
            color: theme.palette.secondary.main,
            transform: 'scale(1.1)',
        },
        '& $listItemText': { color: theme.palette.secondary.main, },
        '&:focus': { backgroundColor: theme.palette.grey[300], },
        '&:hover': { backgroundColor: theme.palette.grey[300], },
    },
    settingsButton: {
        marginBottom: 4 * theme.spacing.unit,
        '&:hover $settingsIcon': {
            transform: 'scale(1.1) rotate(120deg)',
            color: theme.palette.grey[800],
        },
    },
    activeSettingsButton: {
        color: theme.palette.secondary.main,
        '& $settingsIcon': {
            transform: 'scale(1.1)',
            color: theme.palette.secondary.main,
            transform: 'rotate(120deg)',
        },
        '&:hover $settingsIcon': {
            color: theme.palette.secondary.main,
        }
    },
    settingsIcon: {
        color: theme.palette.grey[300],
        transform: 'scale(1)',
        transition: 'color 250ms, transform 500ms ease-out',
    },
}))

const menuItems = [
    { text: 'Home', path: '/', icon: DashboardIcon, },
    { text: 'Proposals', path: '/proposals', icon: ProposalsIcon, },
    { text: 'Collaborations', path: '/collaborations', icon: CollaborationsIcon, },
    { text: 'Study Metrics', path: '/study-metrics', icon: MetricsIcon, },
    // { text: 'Site Reports', path: '/site-reports', icon: SiteReportIcon, },
]

const Menu = props => {
    const classes = useStyles()
    return (
        <div className={ classes.sidebar }>
            <MenuList className={ classes.menuList }>
                {
                    menuItems.map(item => {
                        return (
                            <MenuItem key={ item.path } component={ NavLink } exact to={ item.path } className={ classes.menuItem } activeClassName={ classes.active }>
                                <ListItemIcon className={ classes.listItemIcon }><item.icon /></ListItemIcon>
                                <ListItemText primary={ item.text } classes={{ primary: classes.listItemText }}/>
                            </MenuItem>
                        )
                    })
                }
            </MenuList>

            <div className={ classes.flexer } style={{ pointerEvents: 'none', }}/>

            <Tooltip title="Dashboard Settings" placement="top">
                <IconButton component={ NavLink } to={ '/settings' } className={ classes.settingsButton } activeClassName={ classes.activeSettingsButton }>
                    <SettingsIcon className={ classes.settingsIcon } />
                </IconButton>
            </Tooltip>
        </div>
    )
}

export default Menu
