import React from 'react'
import classnames from 'classnames'
import { makeStyles } from '@material-ui/styles'
import { NavLink } from 'react-router-dom'
import { MenuList, MenuItem, ListItemIcon, ListItemText, Tooltip } from '@material-ui/core'
import {
    Dashboard as DashboardIcon,
    Description as ProposalsIcon,
    // Assessment as ReportsIcon,
    // Timeline as ForecastsIcon,
    Star as MetricsIcon,
    // LocationOn as SiteReportIcon,
    Share as CollaborationsIcon,
    // Build as QueryBuilderIcon,
    // ExitToApp as LogoutIcon,
} from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
    nav: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    menuItem: {
        padding: theme.spacing.unit,
        display: 'flex',
        justifyContent: 'flex-start',
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
        padding: 0,
        margin: 0,
    },
    listItemText: {
        padding: 0,
        margin: 0,
        color: theme.palette.grey[600],
        transition: 'max-width 250ms, opacity 250ms, margin-left 100ms',
    },
    expandedItemText: {
        maxWidth: '240px',
        marginLeft: `${ theme.spacing.unit }px`,
        opacity: 1,
    },
    collapsedItemText: {
        maxWidth: 0,
        marginLeft: 0,
        opacity: 0,
    },
}))

const menuItems = [
    { text: 'Home', path: '/', icon: DashboardIcon, },
    { text: 'Proposals', path: '/proposals', icon: ProposalsIcon, },
    { text: 'Collaborations', path: '/collaborations', icon: CollaborationsIcon, },
    { text: 'Study Metrics', path: '/study-metrics', icon: MetricsIcon, },
    // { text: 'Site Reports', path: '/site-reports', icon: SiteReportIcon, },
]

const Menu = ({ expanded, clickHandler }) => {
    const classes = useStyles()

    return (
        <nav className={ classes.nav }>
            <MenuList>
                {
                    menuItems.map(item => (
                        <Tooltip key={ item.path } title={ expanded ? '' : item.text } placement="right">
                            <MenuItem
                                component={ NavLink } exact to={ item.path }
                                className={ classes.menuItem } activeClassName={ classes.active }
                                onClick={ clickHandler }
                            >
                                <ListItemIcon classes={{ root: classes.listItemIcon }}>
                                    <item.icon />
                                </ListItemIcon>
                                <ListItemText primary={ item.text }
                                    classes={{ root: classnames(classes.listItemText, expanded ? classes.expandedItemText : classes.collapsedItemText) }}
                                />
                            </MenuItem>
                        </Tooltip>
                    ))
                }
            </MenuList>
        </nav>
    )
}

export default Menu