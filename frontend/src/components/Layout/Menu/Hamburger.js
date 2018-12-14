import React from 'react'
import { withStyles } from '@material-ui/core/styles'

const styles = (theme) => ({
    hamburger: {
        width: '25px',
        height: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        '&:hover $line': {
            backgroundColor: theme.palette.secondary.main,
        },

    },
    line: {
        width: '100%',
        minHeight: '4px',
        display: 'block',
        backgroundColor: theme.palette.primary.light,
        borderRadius: '3px',
        transition: 'background-color 250ms, transform 250ms',
    },
})

const hamburger = (props) => {
    const { classes } = props
    return (
        <div className={ classes.hamburger }>
            <span className={ classes.line }></span>
            <span className={ classes.line }></span>
            <span className={ classes.line }></span>
        </div>
    )
}

export default withStyles(styles)(hamburger)