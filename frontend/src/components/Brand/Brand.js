import React from 'react'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
    brand: {
        color: theme.palette.primary.light,
        fontFamily: 'EB Garamond',
        fontSize: '200%',
        backgroundColor: 'transparent',
        padding: `${ theme.spacing(2) }px`,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        opacity: 0.33,
        writingMode: 'vertical-rl',
        transform: 'rotate(180deg)',
        pointerEvents: 'none',
    },
}))

export const Brand = props => {
    const classes = useStyles()
    
    return (
        <div className={ classes.brand }>
            Duke/Vanderbilt&nbsp;TIC
        </div>
    )
}
