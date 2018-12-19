import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { Divider, List, ListSubheader, ListItem, ListItemIcon, ListItemText, Collapse } from '@material-ui/core'
import {
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
} from '@material-ui/icons'

const styles = (theme) => ({
    root: {
        backgroundColor: 'inherit',
    },
    toolbar: {
        ...theme.mixins.toolbar,
    },
    active: {
        backgroundColor: theme.palette.grey[300],
    }
})

class sideBar extends Component {
    state = {
        open: true,
    }

    clickHandler = () => {
        this.setState(state => ({ open: !state.open }))
    }

    render() {
        const { classes, menuItems } = this.props
        return (
            <div className={ classes.root }>
                <div className={ classes.toolbar } />
                {
                    Object.keys(menuItems).map((key) => {
                        let submenu = menuItems[key]
                        return (
                            <Fragment key={ key }>
                                <List>
                                    <ListSubheader>{ submenu.title }</ListSubheader>
                                    {
                                        submenu.items.map(
                                            (item) => {
                                                return (
                                                    item.hasOwnProperty('submenu')
                                                    ? <Fragment key={ item.href }>
                                                        <ListItem button onClick={ this.clickHandler } key={ item.href }>
                                                            <ListItemIcon>{ item.icon }</ListItemIcon>
                                                            <ListItemText primary={ item.text } />
                                                            { this.state.open ? <ExpandLessIcon /> : <ExpandMoreIcon /> }
                                                        </ListItem>
                                                        <Collapse in={ this.state.open } timeout="auto" unmountOnExit>
                                                            <List component="div">
                                                                {
                                                                    item.submenu.map( (item) => {
                                                                        return (
                                                                            <ListItem button component={ NavLink } to={ item.path }
                                                                                key={ item.text + item.path } activeClassName={ classes.active } exact
                                                                            >
                                                                                <ListItemIcon>{ item.icon }</ListItemIcon>
                                                                                <ListItemText primary={ item.text } />
                                                                            </ListItem>
                                                                        )
                                                                    })
                                                                }
                                                            </List>
                                                        </Collapse>
                                                    </Fragment>
                                                    : <ListItem button key={ item.text } component={ NavLink } to={ item.href } activeClassName={ classes.active } exact>
                                                        <ListItemIcon>{ item.icon }</ListItemIcon>
                                                        <ListItemText primary={ item.text } />
                                                    </ListItem>
                                                )
                                            }
                                        )
                                    }
                                </List>
                                <Divider />
                            </Fragment>
                        )
                    })
                }
                <Divider />
            </div>
        )
    }
}

sideBar.propTypes = {
    menuItems: PropTypes.array,
}

export default withStyles(styles)(sideBar)