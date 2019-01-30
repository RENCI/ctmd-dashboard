import React from 'react';
import classnames from 'classnames'
import { Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles';

const styles = ( theme ) => ({
    root: {
        margin: 0,
        marginBottom: 4 * theme.spacing.unit,
        color: theme.palette.primary.main,
        transition: 'margin 250ms',
        [theme.breakpoints.up('sm')]: {
            margin: `0 ${ 2 * theme.spacing.unit } ${ 2 * theme.spacing.unit } ${ 2 * theme.spacing.unit }`,
        }
    }
})

const heading = ( props ) => {
    const { classes, children } = props
    return (
        <Typography variant="h4" className={ classnames(classes.root, props.className) }>
            { children }
        </Typography>
    )
}

export default withStyles(styles)(heading)
