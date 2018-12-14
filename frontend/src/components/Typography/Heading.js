import React from 'react';
import classnames from 'classnames'
import { Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles';

const styles = ( theme ) => ({
    root: {
        margin: theme.spacing.unit,
        color: theme.palette.primary.main,
        transition: 'margin 250ms',
    }
})

const heading = ( props ) => {
    const { classes } = props
    return (
        <Typography variant="h4" className={ classnames(classes.root, props.className) }>
            { props.children }
        </Typography>
    )
}

export default withStyles(styles)(heading)
