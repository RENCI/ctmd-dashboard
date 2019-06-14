import React, { Fragment, useState } from 'react'
import { useTheme } from '@material-ui/styles'
import { Button, Menu, MenuItem, ListItemText, ListItemIcon, Divider } from '@material-ui/core'
import { NavLink } from 'react-router-dom'
import { KeyboardArrowDown as SubmenuIcon } from '@material-ui/icons'
import {
    List as ListIcon,
    CalendarToday as CalendarIcon,
    AccountBalance as InstitutionIcon,
    LocalOffer as TherapeuticAreaIcon,
    Assignment as TicIcon,
    Alarm as StatusIcon,
    LocalLaundryService as ServicesIcon,
} from '@material-ui/icons'

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
                style={{ marginLeft: theme.spacing(2), backgroundColor: theme.palette.common.white }}
            >
                Browse By<SubmenuIcon />
            </Button>
            <Menu id="browse-menu"
                anchorEl={ anchorEl }
                open={ Boolean(anchorEl) }
                onClose={ handleClose }
            >
                <MenuItem component={ NavLink } exact to="/proposals">
                    <ListItemIcon><ListIcon /></ListItemIcon>
                    <ListItemText primary="List All"/>
                </MenuItem>
                <Divider />
                <MenuItem component={ NavLink } to="/proposals/date">
                    <ListItemIcon><CalendarIcon /></ListItemIcon>
                    <ListItemText primary="Date"/>
                </MenuItem>
                <Divider />
                <MenuItem component={ NavLink } to="/proposals/organization">
                    <ListItemIcon><InstitutionIcon /></ListItemIcon>
                    <ListItemText primary="Submitting Institution"/>
                </MenuItem>
                <MenuItem component={ NavLink } to="/proposals/tic">
                    <ListItemIcon><TicIcon /></ListItemIcon>
                    <ListItemText primary="Assigned TIC/RIC"/>
                </MenuItem>
                <Divider />
                <MenuItem component={ NavLink } to="/proposals/therapeutic-area">
                    <ListItemIcon><TherapeuticAreaIcon /></ListItemIcon>
                    <ListItemText primary="Therapeutic Area"/>
                </MenuItem>
                <Divider />
                <MenuItem component={ NavLink } to="/proposals/requested-services">
                    <ListItemIcon><ServicesIcon /></ListItemIcon>
                    <ListItemText primary="Resources Requested"/>
                </MenuItem>
                <MenuItem component={ NavLink } to="/proposals/approved-services">
                    <ListItemIcon><ServicesIcon /></ListItemIcon>
                    <ListItemText primary="Resources Approved"/>
                </MenuItem>
                <Divider />
                <MenuItem component={ NavLink } to="/proposals/status">
                    <ListItemIcon><StatusIcon /></ListItemIcon>
                    <ListItemText primary="Status"/>
                </MenuItem>
            </Menu>
        </Fragment>
    )
}

export default BrowseMenu