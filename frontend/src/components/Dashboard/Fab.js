import React from 'react'
import classnames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import { Button } from '@material-ui/core'
import { Dashboard as DashboardIcon } from '@material-ui/icons'

import { AuthConsumer } from '../../contexts/AuthContext'

const styles = (theme) => ({
    auth: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        '&:hover': {
            backgroundColor: theme.palette.primary.dark,
        }
    },
    noauth: {
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.common.black,
        '&:hover': {
            backgroundColor: theme.palette.secondary.dark,
        }
    },
    button: {
        position: 'fixed',
        right: 2 * theme.spacing.unit,
        top: 0,
        minWidth: 5 * theme.spacing.unit,
        maxWidth: 5 * theme.spacing.unit,
        height: 6 * theme.spacing.unit,
        borderRadius: 0,
        borderBottomLeftRadius: 1 * theme.spacing.unit,
        borderBottomRightRadius: 1 * theme.spacing.unit,
        display: 'flex',
        justifyContent: 'flex-start',
        padding: theme.spacing.unit,
        overflow: 'hidden',
        transition: 'max-width 750ms, opacity 1000ms, background-color 250ms, color 500ms',
        opacity: 0.75,
        [theme.breakpoints.up('sm')]: {
            maxWidth: 18 * theme.spacing.unit,
            opacity: 1,
            transition: 'max-width 250ms, opacity 1000ms, background-color 250ms, color 500ms',
        }
    },
    buttonIcon: {
    },
    buttonText: {
        opacity: 0,
        transition: 'opacity 750ms',
        paddingLeft: theme.spacing.unit,
        [theme.breakpoints.up('sm')]: {
            opacity: 1,
            transition: 'opacity 250ms',
        }
    },
})

const dashboardButton = (props) => {
    const { classes } = props
    return (
        <AuthConsumer>
            {
                (context) => {
                    const authColorClass = context.authenticated === true ? classes.auth : classes.noauth
                    return (
                        <Button
                            variant="contained"
                            className={ classnames(classes.button, authColorClass) }
                            component={ Link }
                            to="/dashboard"
                        >
                            <DashboardIcon className={ classes.buttonIcon }/>
                            <div className={ classes.buttonText }>Dashboard</div>
                        </Button>
                    )
                }
            }
        </AuthConsumer>
    )
}

export default withStyles(styles)(dashboardButton)
