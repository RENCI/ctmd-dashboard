import React from 'react';
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom'

const useStyles = makeStyles(theme => ({
    paragraph: {
        color: theme.palette.grey[600],
        margin: theme.spacing(1),
        fontSize: '0.75rem',
    },
}))

export const Caption = props => {
    const { children } = props
    const classes = useStyles()
    
    return (
        <Typography paragraph className={ classes.paragraph } { ...props }>
            { children }
        </Typography>
    )
}
