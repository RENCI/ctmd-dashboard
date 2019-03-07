import React, { Fragment, useState } from 'react'
import { useTheme } from '@material-ui/styles'
import { Button, Menu, ListItemText, MenuItem, Divider } from '@material-ui/core'
import { NavLink } from 'react-router-dom'
import { KeyboardArrowDown as SubmenuIcon } from '@material-ui/icons'

const BrowseMenu = (props) => {
    const [anchorEl, setAnchorEl] = useState(null)
    const theme  = useTheme()

    const handleClick = event => {
        setAnchorEl(event.currentTarget)
        event.preventDefault()
    }
    
    const handleClose = () => {
        setAnchorEl(null)
    }

    return (
        <Fragment>
            <Button variant="contained"
                aria-owns={ anchorEl ? 'browse-menu' : undefined }
                aria-haspopup="true"
                onClick={ handleClick }
                style={{ marginLeft: 2 * theme.spacing.unit, backgroundColor: theme.palette.common.white }}
            >
                Browse By<SubmenuIcon />
            </Button>
            <Menu id="browse-menu"
                anchorEl={ anchorEl }
                open={ Boolean(anchorEl) }
                onClose={ handleClose }
            >
                <MenuItem component={ NavLink } exact to="/proposals">
                    <ListItemText primary="List All"/>
                </MenuItem>
                <Divider />
                <MenuItem component={ NavLink } to="/proposals/date">
                    <ListItemText primary="Date"/>
                </MenuItem>
                <Divider />
                <MenuItem component={ NavLink } to="/proposals/organization">
                    <ListItemText primary="Submitting Institution"/>
                </MenuItem>
                <MenuItem component={ NavLink } to="/proposals/tic">
                    <ListItemText primary="Assigned TIC/RIC"/>
                </MenuItem>
                <Divider />
                <MenuItem component={ NavLink } to="/proposals/therapeutic-area">
                    <ListItemText primary="Therapeutic Area"/>
                </MenuItem>
                <Divider />
                <MenuItem component={ NavLink } to="/proposals/requested-services">
                    <ListItemText primary="Services Requested"/>
                </MenuItem>
                <MenuItem component={ NavLink } to="/proposals/approved-services">
                    <ListItemText primary="Services Approved"/>
                </MenuItem>
                <Divider />
                <MenuItem component={ NavLink } to="/proposals/status">
                    <ListItemText primary="Status"/>
                </MenuItem>
            </Menu>
        </Fragment>
    )
}

export default BrowseMenu