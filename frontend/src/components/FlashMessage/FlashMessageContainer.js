import React from 'react'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
    root: {
        position: 'fixed',
        left: '50%',
        right: 'auto',
        bottom: 0,
        transform: 'translateX(-50%)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column-reverse',
    },
}))

const FlashMessageContainer = props => {
    const { children } = props
    const classes = useStyles()

    return (
        <div className={ classes.root }>
            { children }
        </div>
    )
}

export default FlashMessageContainer