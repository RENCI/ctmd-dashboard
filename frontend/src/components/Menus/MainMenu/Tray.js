import React, { useState } from 'react'
import classnames from 'classnames'
import { NavLink } from 'react-router-dom'
import { Paper, Tooltip, IconButton } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { KeyboardArrowRight as ExpandIcon, Settings as SettingsIcon } from '@material-ui/icons'
import Menu from './Menu'

const useStyles = makeStyles(theme => ({
    tray: {
        borderRadius: 0,
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 99,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        minWidth: '2rem',
        transition: 'min-width 250ms',
    },
    open: {
        minWidth: '180px',
    },
    toggler: {
        margin: '0.5rem',
        transition: 'transform 250ms',
        '&.rotated': {
            transform: 'rotate(180deg)',
        }
    },
    flexer: { flex: 1, },
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

const Tray = ({ children }) => {
    const [open, setOpen] = useState()
    const classes = useStyles()
    
    const handleToggleOpen = () => setOpen(!open)
    const handleClose = () => setOpen(false)

    return (
        <Paper className={ classnames(classes.tray, open ? classes.open : null) }>
            <IconButton className={ classnames(classes.toggler, open ? classes.rotated : null) } onClick={ handleToggleOpen }>
                <ExpandIcon />
            </IconButton>

            <Menu expanded={ open } clickHandler={ handleClose } />

            <div className={ classes.flexer } style={{ pointerEvents: 'none', }}/>

            <Tooltip title="Dashboard Settings" placement="top">
                <IconButton component={ NavLink } to={ '/settings' } className={ classes.settingsButton } activeClassName={ classes.activeSettingsButton }>
                    <SettingsIcon className={ classes.settingsIcon } />
                </IconButton>
            </Tooltip>
        </Paper>
    )
}

export default Tray