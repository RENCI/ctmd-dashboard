import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom'

const useStyles = makeStyles(theme => ({
    textlink: {
        color: theme.palette.secondary.main,
        transition: 'color 250ms',
        '&:hover': {
            color: theme.palette.primary.main,
        }
    },
}))

export const TextLink = props => {
    const { children } = props
    const classes = useStyles()
    
    return (
        <Link
            to={ props.to }
            className={ classes.textLink }
            target={ props.external ? '_blank' : '_top' }
            { ...props }
        >
            { children }
        </Link>
    )
}