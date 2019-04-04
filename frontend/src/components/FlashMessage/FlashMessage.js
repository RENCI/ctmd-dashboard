import React, { useState, useEffect } from 'react'
import classnames from 'classnames'
import { makeStyles } from '@material-ui/styles'
import { Close as CloseIcon } from '@material-ui/icons'
import { Snackbar, SnackbarContent, IconButton, Button } from '@material-ui/core'
import { CheckCircle as SuccessIcon, Error as ErrorIcon, Info as InfoIcon } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
    flashMessageContainer: {
        position: 'fixed',
        left: '50%',
        right: 'auto',
        bottom: 0,
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column-reverse',
        width: '90%',
        [theme.breakpoints.up('sm')]: {
            width: '500px',
        }
    },
    snackbar: {
        position: 'relative',
        marginBottom: theme.spacing.unit,
    },
    flashMessage: {
        borderRadius: theme.spacing.unit,
    },
    messageSpan: {
        display: 'flex',
        alignItems: 'center',
    },
    icon: {
        marginRight: theme.spacing.unit,
    },
    success: { backgroundColor: theme.palette.flashMessage.success, },
    info: { backgroundColor: theme.palette.flashMessage.info, },
    warning: { backgroundColor: theme.palette.flashMessage.warning, },
    error: { backgroundColor: theme.palette.flashMessage.error, },
}))

const icon = {
    success: SuccessIcon,
    info: InfoIcon,
    warning: ErrorIcon,
    error: ErrorIcon,
}

export const FlashMessageContainer = props => {
    const { children } = props
    const classes = useStyles()

    return (
        <div className={ classes.flashMessageContainer }>
            { children }
        </div>
    )
}

export const FlashMessage = props => {
    const [open, setOpen] = useState(true)
    const { messageType, messageText } = props
    const classes = useStyles()
    const Icon = icon[messageType];
    
    useEffect(() => {
        setOpen(true)
    }, [props.message])

    const handleClick = () => setOpen(true)

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setOpen(false)
    }

    return (
        <Snackbar
            className={ classes.snackbar }
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            open={ open }
            autoHideDuration={ 3000 }
            onClose={ handleClose }
        >
            <SnackbarContent
                className={ classnames(classes.flashMessage, classes[messageType]) }
                message={
                    <span className={ classes.messageSpan }>
                        <Icon className={ classes.icon } />
                        { messageText }
                    </span>
                }
                action={[
                    <IconButton key="close" aria-label="Close" color="inherit" onClick={ handleClose }>
                        <CloseIcon />
                    </IconButton>,
                ]}
            />
        </Snackbar>
    )
}
