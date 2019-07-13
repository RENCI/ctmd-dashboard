import React from 'react';
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom'

const useStyles = makeStyles(theme => ({
    title: {
        marginBottom: theme.spacing(6),
    },
}))

export const Title = props => {
    const { children } = props
    const classes = useStyles()
    
    return (
        <Typography variant="h1" classes={{ root: classes.heading }} { ...props }>
            { children }
        </Typography>
    )
}
