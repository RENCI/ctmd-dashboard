import React from 'react';
import { Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles';

const styles = ( theme ) => ({
    root: {
        marginBottom: 2 * theme.spacing.unit,
        color: theme.palette.primary.main,
        marginTop: 0,
        textAlign: 'center',
        [theme.breakpoints.up('sm')]: {
            marginTop: 2 * theme.spacing.unit,
        },
        [theme.breakpoints.up('md')]: {
            marginTop: 4 * theme.spacing.unit,
            textAlign: 'left',
        },
    }
})

const title = ( props ) => {
    const { classes } = props
    return (
        <Typography variant="h2" className={ [classes.root, props.className].join(' ') }>
            { props.children }
        </Typography>
    )
}

export default withStyles(styles)(title)
