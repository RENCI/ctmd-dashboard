import React from 'react';
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom'

const useStyles = makeStyles(theme => ({
    subsubheading: {
        marginBottom: '0.5rem',
    },
}))

export const Subsubheading = props => {
    const { children } = props
    const classes = useStyles()
    
    return (
        <Typography variant="h4" className={ classes.subsubheading } { ...props }>
            { children }
        </Typography>
    )
}
