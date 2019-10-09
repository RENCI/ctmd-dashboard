import React from 'react';
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
    subheading: {},
}))

export const Subheading = props => {
    const { children } = props
    const classes = useStyles()
    
    return (
        <Typography variant="h3" className={ classes.subheading } { ...props }>
            { children }
        </Typography>
    )
}
