import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'

const styles = (theme) => ({
    root: {
        ...theme.mixins.container
    }
})

const container = (props) => {
    const { classes } = props
    return (
        <div className={ classes.root }>
            { props.children }
        </div>
    )
}

container.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(container)