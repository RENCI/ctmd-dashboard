import React from 'react';
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
    title: {
        marginBottom: theme.spacing(6),
    },
}))

export const Subtitle = props => {
    const { children } = props
    const classes = useStyles()
    
    return (
        <Typography variant="h2" classes={{ root: classes.title }} { ...props }>
            { children }
        </Typography>
    )
}
