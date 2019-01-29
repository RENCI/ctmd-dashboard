import React, { Component, Fragment } from 'react'
import { Menu, ListItemIcon, ListItemText, IconButton, MenuItem } from '@material-ui/core'
import { NavLink } from 'react-router-dom'
import { AccountCircle as AccountIcon } from '@material-ui/icons'

class UserMenu extends Component {
    state = {
        anchorEl: null
    }
    handleClick = event => {
        this.setState({ anchorEl: event.currentTarget });
    }
    handleClose = () => {
        this.setState({ anchorEl: null });
    }
    render() {
        const { anchorEl } = this.state
        return (
            <Fragment>
                <IconButton aria-owns={ anchorEl ? 'user-menu' : undefined }
                  aria-haspopup="true"
                  onClick={ this.handleClick }
                >
                    <AccountIcon fontSize="default" />
                </IconButton>
                <Menu id="user-menu"
                    anchorEl={ anchorEl }
                    open={ Boolean(anchorEl) }
                    onClose={ this.handleClose }
                >
                    {
                        this.props.menuItems.map((item) => {
                            return (
                                <MenuItem button component={ NavLink } to={ item.href }
                                    key={ item.text } onClick={ this.handleClose }
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
}

export default UserMenu