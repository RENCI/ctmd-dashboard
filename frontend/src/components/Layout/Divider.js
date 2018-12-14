import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { Divider } from '@material-ui/core'

const styles = (theme) => ({
    root: {}
})

const divider = (props) => {
    const { classes } = props
    return (
        <Divider/>
    )
}

divider.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(divider)