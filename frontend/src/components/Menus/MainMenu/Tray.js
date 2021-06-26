import React, { useState, useContext } from 'react'
import classnames from 'classnames'
import { NavLink } from 'react-router-dom'
import { Paper, Tooltip, IconButton, ClickAwayListener } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { KeyboardArrowRight as ExpandIcon, AccountCircle as UserIcon, Lock as AdminIcon } from '@material-ui/icons'
import { Menu } from './Menu'
import { Brand } from '../../Brand'
import { useWindowSize } from '../../../hooks'
import { AuthContext } from '../../../contexts'

const useStyles = makeStyles((theme) => ({
  tray: {
    // ...theme.mixins.debug,
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
    maxWidth: '4.6rem',
    transition: 'min-width 250ms',
    padding: 0,
    backgroundImage: `linear-gradient(${theme.palette.extended.shaleBlue}, ${theme.palette.extended.magnolia})`,
    boxShadow: '0 0 8px 2px rgba(0, 0, 0, 0.2)',
  },
  open: {
    minWidth: '200px',
  },
  toggler: {
    marginTop: '0.5rem',
    transition: 'transform 500ms 250ms, background-color 250ms',
    color: theme.palette.grey[300],
  },
  rotated: {
    transform: 'rotate(-180deg)',
  },
  flexer: { flex: 1 },
  trayButton: {
    marginBottom: theme.spacing(4),
    '&:hover $profileIcon': {
      color: theme.palette.common.white,
    },
  },
  activeTrayButton: {
    backgroundColor: theme.palette.extended.eno,
    '& $profileIcon': {
      color: theme.palette.common.white,
    },
    '&:hover $profileIcon': {
      color: theme.palette.common.white,
    },
  },
  trayIcon: {
    color: theme.palette.grey[300],
    transform: 'scale(1)',
    transition: 'color 250ms, transform 500ms ease-out',
  },
}))

export const MenuTray = ({ children }) => {
  const [open, setOpen] = useState()
  const { height } = useWindowSize()
  const classes = useStyles()
  const { isPLAdmin } = useContext(AuthContext)

  const showDataManagerButton = process.env.REACT_APP_IS_HEAL_SERVER === 'false' // not on heal server
                                || (process.env.REACT_APP_IS_HEAL_SERVER === 'true' && isPLAdmin) // on heal server as a pladmin

  const handleToggleOpen = () => setOpen(!open)
  const handleClose = () => setOpen(false)

  return (
    <ClickAwayListener onClickAway={open ? handleClose : () => {}}>
      <Paper className={classnames(classes.tray, open ? classes.open : null)}>
        <IconButton className={classnames(classes.toggler, open ? classes.rotated : null)} onClick={handleToggleOpen}>
          <ExpandIcon />
        </IconButton>

        <Menu expanded={open} clickHandler={handleClose} />

        <div className={classes.flexer} style={{ pointerEvents: 'none' }} />

        {height > 800 && <Brand />}

        <div className={classes.flexer} style={{ pointerEvents: 'none' }} />

        <Tooltip title="User Profile & Settings" placement="right">
          <IconButton component={NavLink} to={'/profile'} className={classes.trayButton} activeClassName={classes.activeTrayButton}>
            <UserIcon className={classes.trayIcon} />
          </IconButton>
        </Tooltip>
        <>
          {
            showDataManagerButton && (
              <Tooltip title="Data Manager" placement="right">
                <IconButton component={NavLink} to={'/manage'} className={classes.trayButton} activeClassName={classes.activeTrayButton}>
                  <AdminIcon className={classes.trayIcon} />
                </IconButton>
              </Tooltip>
            )
          }
        </>
      </Paper>
    </ClickAwayListener>
  )
}
