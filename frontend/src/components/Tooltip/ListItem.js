import React from 'react'
import classnames from 'classnames'
import { withStyles } from '@material-ui/core/styles'

const styles = (theme) => ({
    item: {
        display: 'flex',
        marginBottom: theme.spacing.unit,
    },
    twoLines: {
        flexDirection: 'column',
    },
    title: {
        fontWeight: 'bold',
        marginRight: theme.spacing.unit,
    },
    content: {
        flex: 1,
    },
})

const listItem = (props) => {
    const { classes, title, content, twoLines } = props
    return (
        <div className={ classnames(classes.item, twoLines ? classes.twoLines : null) }>
            <div className={ classes.title }>{ title }:</div>
            <div className={ classes.content }>{ content }</div>
        </div>
    )
}

export default withStyles(styles)(listItem)