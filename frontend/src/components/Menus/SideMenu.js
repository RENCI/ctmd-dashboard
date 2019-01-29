import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { Divider, List, ListItem, ListItemIcon, ListItemText, Collapse } from '@material-ui/core'
import {
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
} from '@material-ui/icons'

const styles = (theme) => ({
    sideBar: {
        backgroundColor: 'transparent',
    },
    activeLink: {
        backgroundColor: theme.palette.extended.prussianBlue,
    },
    itemLink: {
        '&:hover': {
            backgroundColor: theme.palette.extended.prussianBlue,
        },
    },
    itemIcon: { },
    itemText: {
        fontWeight: 'bold',
    },
})

class sideBar extends Component {
    state = {
        open: false,
    }

    clickHandler = () => {
        this.setState(state => ({ open: !state.open }))
    }

    render() {
        const { classes, menuItems } = this.props
        return (
            <div className={ classes.sideBar }>
                {
                    Object.keys(menuItems).map((key) => {
                        let submenu = menuItems[key]
                        return (
                            <Fragment key={ key }>
                                <List>
                                    {
                                        submenu.items.map((item) => {
                                            return item.hasOwnProperty('submenu') ? (
                                                <Fragment key={ item.href }>
                                                    <ListItem button onClick={ this.clickHandler } key={ item.href } className={ classes.itemLink }>
                                                        <ListItemIcon className={ classes.itemIcon }>{ item.icon }</ListItemIcon>
                                                        <ListItemText className={ classes.itemText } primary={ item.text } />
                                                        { this.state.open ? <ExpandLessIcon /> : <ExpandMoreIcon /> }
                                                    </ListItem>
                                                    <Collapse in={ this.state.open } timeout="auto" unmountOnExit>
                                                        <List component="div">
                                                            {
                                                                item.submenu.map((item) => {
                                                                    return (
                                                                        <ListItem button component={ NavLink } to={ item.path } exact
                                                                            key={ item.text + item.path } className={ classes.itemLink } activeClassName={ classes.activeLink }
                                                                        >
                                                                            <ListItemIcon className={ classes.itemIcon }>{ item.icon }</ListItemIcon>
                                                                            <ListItemText className={ classes.itemText } primary={ item.text } />
                                                                        </ListItem>
                                                                    )
                                                                })
                                                            }
                                                        </List>
                                                    </Collapse>
                                                </Fragment>
                                            ) : (
                                                <ListItem component={ NavLink } to={ item.href } exact
                                                    button key={ item.text } className={ classes.itemLink }
                                                    activeClassName={ classes.activeLink } disabled={ item.disabled }
                                                >
                                                    <ListItemIcon className={ classes.itemIcon }>{ item.icon }</ListItemIcon>
                                                    <ListItemText className={ classes.itemText } primary={ item.text } />
                                                </ListItem>
                                            )
                                        })
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