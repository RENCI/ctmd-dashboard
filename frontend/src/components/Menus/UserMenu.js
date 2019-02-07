import React, { Fragment, useState, useEffect } from 'react'
import { Menu, ListItemIcon, ListItemText, IconButton, MenuItem } from '@material-ui/core'
import { NavLink } from 'react-router-dom'
import { AccountCircle as AccountIcon } from '@material-ui/icons'

const UserMenu = (props) => {
    const [anchorEl, setAnchorEl] = useState(null)
    
    const handleClick = event => {
        setAnchorEl(event.currentTarget)
    }
    
    const handleClose = () => {
        setAnchorEl(null)
    }

    return (
        <Fragment>
            <IconButton aria-owns={ anchorEl ? 'user-menu' : undefined }
              aria-haspopup="true"
              onClick={ handleClick }
            >
                <AccountIcon fontSize="default" />
            </IconButton>
            <Menu id="user-menu"
                anchorEl={ anchorEl }
                open={ Boolean(anchorEl) }
                onClose={ handleClose }
            >
                {
                    props.menuItems.map((item) => {
                        return (
                            <MenuItem button component={ NavLink } to={ item.href }
                                key={ item.text } onClick={ handleClose }
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
}

export default UserMenu