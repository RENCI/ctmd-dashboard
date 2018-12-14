import React from 'react'
import { NavLink } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { Paper, MenuItem, MenuList } from '@material-ui/core'

const styles = (theme) => ({
    root: {
        marginBottom: 2 * theme.spacing.unit,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: theme.palette.grey[100],
        position: 'relative',
    },
    menu: {
        padding: theme.spacing.unit,
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
        transition: 'left 250ms, transform 250ms',
        [theme.breakpoints.up('sm')]: {
            left: 0,
            transform: 'translateX(0)',
        }
    },
    link: {
        [theme.breakpoints.down('xs')]: {
            borderRadius: theme.shape.borderRadius,
        },
        '&:hover': {
            backgroundColor: 'transparent',
            [theme.breakpoints.down('xs')]: {
            backgroundColor: theme.palette.grey[300],
            },
        },
    },
    active: {
        color: theme.palette.secondary.main,
    },
})

const menuLinks = [
    { text: 'Home', href: '/home', },
    { text: 'About', href: '/about', },
    { text: 'Reports', href: '/reports', },
    { text: 'Contact', href: '/contact', },
]

const menu = (props) => {
    const { classes } = props
    return (
        <Paper component='nav' elevation={ 0 } className={ classes.root }>
            <MenuList className={ classes.menu } >
                {
                    menuLinks.map( ( link, index ) => {
                        return (
                            <MenuItem
                                exact
                                disableRipple
                                className={ classes.link }
                                activeClassName={ classes.active }
                                key={ index }
                                component={ NavLink }
                                to={ link.href }
                            >
                                { link.text }
                            </MenuItem>
                        )
                    })
                }
            </MenuList>
        </Paper>
    )
}

export default withStyles(styles)(menu)