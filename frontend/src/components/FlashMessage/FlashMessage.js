import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Close as CloseIcon } from '@material-ui/icons'
import { Snackbar, IconButton, Button } from '@material-ui/core'

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
    flashMessage: {
        position: 'relative',
        marginBottom: theme.spacing.unit,
    },
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
    const { message } = props
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
            className={ classes.flashMessage }
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            open={ open }
            autoHideDuration={ 3000 }
            onClose={ handleClose }
            ContentProps={{ 'aria-describedby': 'message-id' }}
            message={ <span id="message-id">{ message }</span> }
            action={[
                <IconButton key="close" aria-label="Close" color="inherit" onClick={ handleClose }>
                    <CloseIcon />
                </IconButton>,
            ]}
        />
    )
}
