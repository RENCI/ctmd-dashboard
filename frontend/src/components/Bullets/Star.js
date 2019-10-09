import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { Star as StarIcon } from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
    bullet: {
        fontSize: 24,
        color: theme.palette.primary.light,
        opacity: 0.25,
    }
}))

export const StarBullet = props => {
    const classes = useStyles()
    return <StarIcon className={ classes.bullet } />
}

