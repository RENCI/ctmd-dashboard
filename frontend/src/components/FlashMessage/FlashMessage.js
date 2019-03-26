import React, { useState, useEffect } from 'react'
import { Close as CloseIcon } from '@material-ui/icons'
import { Snackbar, IconButton, Button } from '@material-ui/core'

const FlashMessage = props => {
    const [open, setOpen] = useState(true)
    const { message } = props
    
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