import React, { useState, useEffect } from 'react'
import classnames from 'classnames'
import { makeStyles } from '@material-ui/styles'
import { Close as CloseIcon } from '@material-ui/icons'
import { Snackbar, SnackbarContent, IconButton, Button } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
    flashMessageContainer: {
        position: 'fixed',
        left: '50%',
        right: 'auto',
        bottom: 0,
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column-reverse',
    },
    snackbar: {
        position: 'relative',
        marginBottom: theme.spacing.unit,
    },
    flashMessage: {
        borderRadius: theme.spacing.unit,
    },
    success: { backgroundColor: theme.palette.flashMessage.success, },
    info: { backgroundColor: theme.palette.flashMessage.info, },
    warning: { backgroundColor: theme.palette.flashMessage.warning, },
    error: { backgroundColor: theme.palette.flashMessage.error, },
}))


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
                ContentProps={{ 'aria-describedby': 'message-id' }}
                message={ <span id="message-id">{ messageText }</span> }
                action={[
                    <IconButton key="close" aria-label="Close" color="inherit" onClick={ handleClose }>
                        <CloseIcon />
                    </IconButton>,
                ]}
            />
        </Snackbar>
    )
}
