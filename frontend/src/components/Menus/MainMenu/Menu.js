import React, { useEffect, useContext } from 'react'
import classnames from 'classnames'
import { makeStyles } from '@material-ui/styles'
import { NavLink } from 'react-router-dom'
import { MenuList, MenuItem, ListItemIcon, ListItemText, Tooltip, Divider } from '@material-ui/core'
import {
  Home as HomeIcon,
  Description as ProposalsIcon,
  Assignment as StudiesIcon,
  LocationOn as SitesIcon,
  Share as CollaborationsIcon,
  CloudUpload as UploadIcon,
} from '@material-ui/icons'
import { CTSAIcon } from '../../Icons/Ctsa'
import { TINLogoIcon } from '../../Icons/TinLogo'
import { HEALIcon } from '../../Icons/Heal'
import axios from 'axios'
import api from '../../../Api'
import { AuthContext } from '../../../contexts'

const useStyles = makeStyles((theme) => ({
  nav: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: theme.spacing(2),
    width: '100%',
  },
  menuList: {
    // minWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  menuItem: {
    // ...theme.mixins.debug,
    padding: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(2),
    margin: '0 0 0.1rem 0',
    borderRadius: theme.shape.borderRadius,
    transition: 'background-color 250ms',
    letterSpacing: '1px',
    '&:hover': {
      backgroundColor: theme.palette.extended.prussianBlue,
      '& $listItemIcon': {
        transformOrigin: '50% 50%',
        transform: 'scale(1.2)',
      },
    },
  },
  listItemIcon: {
    opacity: 0.8,
    fontSize: '200%',
    transform: 'scale(1)',
    transition: 'transform 250ms',
    padding: 0,
    margin: 0,
    display: 'flex',
    justifyContent: 'center',
    maxWidth: '2rem',
    color: theme.palette.grey[300],
  },
  listItemText: {
    padding: 0,
    margin: 0,
    color: theme.palette.grey[300],
    transition: 'max-width 250ms, opacity 250ms',
  },
  expandedItemText: {
    maxWidth: '180px',
    opacity: 1,
  },
  collapsedItemText: {
    maxWidth: 0,
    opacity: 0,
  },
  active: {
    backgroundColor: theme.palette.extended.prussianBlue,
    '& > $listItemIcon': {
      color: theme.palette.common.white,
      transform: 'scale(1.1)',
    },
    '& > $listItemText': {
      color: theme.palette.common.white,
    },
  },
}))

const menuItems = [
  {}, // an empty object causes a Divider component to render in the menu
  { text: 'Home', path: '/', icon: HomeIcon },
  { text: 'Proposals', path: '/proposals', icon: ProposalsIcon },
  { text: 'Studies', path: '/studies', icon: StudiesIcon },
  { text: 'Sites', path: '/sites', icon: SitesIcon },
  { text: 'CTSAs', path: '/ctsas', icon: CTSAIcon },
  {}, // an empty object causes a Divider component to render in the menu
  { text: 'Collaborations', path: '/collaborations', icon: CollaborationsIcon },
  {}, // an empty object causes a Divider component to render in the menu
  { text: 'TIN Dashboard', path: 'https://redcap.vanderbilt.edu/plugins/TIN/', icon: TINLogoIcon },
  {
    text: 'HEAL Dashboard',
    path: 'https://redcap.vanderbilt.edu/plugins/TIN/sso/send_login?target-url=https://heal-ctmd.renci.org/api/auth',
    icon: HEALIcon,
  },
]

export const Menu = ({ expanded, clickHandler }) => {
  const classes = useStyles()
  const { isPLAdmin } = useContext(AuthContext)

  const uploadMenuItem = { text: 'Uploads', path: '/uploads', icon: UploadIcon }
  const shouldRenderUploadMenuItem = (!menuItems.some((e) => e.text === 'Uploads'))
        && ((process.env.NODE_ENV === 'development') || (process.env.REACT_APP_IS_HEAL_SERVER === 'true' && isPLAdmin))

  if (shouldRenderUploadMenuItem) {
    menuItems.splice(6, 0, uploadMenuItem)
  }

  return (
    <nav className={classes.nav}>
      <MenuList clsasname={classes.menuList}>
        {menuItems.map((item, i) =>
          item.text && item.path && item.icon ? (
            <Tooltip key={`${i}-item`} title={expanded ? '' : item.text} placement="right">
              {item.path.match(/^http/) ? (
                <MenuItem
                  component={'a'}
                  href={item.path}
                  target={item.text == 'HEAL Dashboard' ? '_self' : '_blank'}
                  rel={item.text == 'HEAL Dashboard' ? '' : 'noopener noreferrer'}
                  className={classes.menuItem}
                  onClick={clickHandler}
                >
                  <ListItemIcon classes={{ root: classes.listItemIcon }}>
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    classes={{ root: classnames(classes.listItemText, expanded ? classes.expandedItemText : classes.collapsedItemText) }}
                  />
                </MenuItem>
              ) : (
                <MenuItem
                  component={NavLink}
                  exact
                  to={item.path}
                  className={classes.menuItem}
                  activeClassName={classes.active}
                  onClick={clickHandler}
                >
                  <ListItemIcon classes={{ root: classes.listItemIcon }}>
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    classes={{ root: classnames(classes.listItemText, expanded ? classes.expandedItemText : classes.collapsedItemText) }}
                  />
                </MenuItem>
              )}
            </Tooltip>
          ) : (
            <Divider key={`${i}-divider`} style={{ margin: '1rem 0' }} />
          )
        )}
      </MenuList>
    </nav>
  )
}
