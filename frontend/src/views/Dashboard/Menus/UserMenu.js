import React, { Fragment } from 'react'
import { Menu, ListItemIcon, ListItemText, IconButton, MenuItem } from '@material-ui/core'
import { NavLink } from 'react-router-dom'
import toRenderProps from 'recompose/toRenderProps'
import withState from 'recompose/withState'
import { Person as PersonIcon } from '@material-ui/icons'

const WithState = toRenderProps(withState('anchorEl', 'updateAnchorEl', null))

const userMenu = (props) => {
    return (
        <WithState>
            {({ anchorEl, updateAnchorEl }) => {
                const open = Boolean(anchorEl)
                const handleClose = () => {
                    updateAnchorEl(null)
                }

                return (
                    <Fragment>
                        <IconButton variant="fab"
                            color="secondary"
                            aria-owns={open ? 'user-menu' : undefined}
                            aria-label="User Menu"
                            aria-haspopup="true"
                            onClick={event => updateAnchorEl(event.currentTarget) }
                        >
                            <PersonIcon fontSize="small" />
                        </IconButton>
                        <Menu id="user-menu" anchorEl={ anchorEl } open={ open } onClose={ handleClose }>
                            {
                                props.menuItems.map((item) => {
                                    return (
                                        <MenuItem button component={ NavLink } to={ item.href }
                                            key={ item.text } onClick={ item.onClick || null }
                                        >
                                            <ListItemIcon>{ item.icon }</ListItemIcon>
                                            <ListItemText primary={ item.text } />
                                        </MenuItem>
                                    )
                                })
                            }
                        </Menu>
                    </Fragment>
                )
            }}
        </WithState>
    )
}

export default userMenu