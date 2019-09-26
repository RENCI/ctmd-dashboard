import React from 'react';
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
    heading: {
        margin: 0,
        marginBottom: theme.spacing(4),
        transition: 'margin 250ms',
        [theme.breakpoints.up('sm')]: {
            margin: `0 ${ theme.spacing(2) } ${ theme.spacing(2) } ${ theme.spacing(2) }`,
        }
    },
}))

export const Heading = props => {
    const { children } = props
    const classes = useStyles()
    
    return (
        <Typography variant="h2" className={ classes.heading } { ...props }>
            { children }
        </Typography>
    )
}
