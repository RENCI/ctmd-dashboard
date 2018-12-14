import React from 'react'
import { Link } from 'react-router-dom'
import classnames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'

const styles = (theme) => ({
    textlink: {
        color: theme.palette.secondary.main,
        transition: 'color 250ms',
        '&:hover': {
            color: theme.palette.primary.main,
        }
    },
})

const textLink = (props) => {
    const { classes } = props
    return (
        <Link
            to={ props.to }
            className={ classnames(classes.textlink, props.className) }
            target={ props.external ? '_blank' : '_top' }
        >
            { props.children }
        </Link>
    )
}

textLink.defaultProps = {
    external: false,
}

textLink.propTypes = {
    classes: PropTypes.object.isRequired,
    to: PropTypes.string.isRequired,
}

export default withStyles(styles)(textLink)