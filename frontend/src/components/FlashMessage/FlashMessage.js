import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Close as CloseIcon } from '@material-ui/icons'
import { Snackbar, IconButton, Button } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
    snackbar: {
        position: 'relative',
        marginBottom: 2 * theme.spacing.unit,
    },
}))

const FlashMessage = props => {
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
            className={ classes.snackbar }
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

export default FlashMessage