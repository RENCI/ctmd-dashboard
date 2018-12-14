import React from 'react'
import { withStyles } from '@material-ui/core/styles'

import Title from '../Typography/Title'

const styles = theme => ({
    root: {
        width: '100%',
        backgroundColor: 'transparent',
    },
})

const header = ( props ) => {
    const { classes } = props
    return (
        <header className={ classes.root }>
            <Title>Duke/Vanderbilt Trial Innovation Center</Title>
        </header>
    )
}

export default withStyles(styles)(header)