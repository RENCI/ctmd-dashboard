import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { Paragraph } from '../Typography'

const useStyles = makeStyles(theme => ({
    root: {
        padding: `${ theme.spacing(8) }px ${ theme.spacing(4) }px`,
        marginLeft: '6rem',
    }
}))

export const Footer = props => {
    const classes = useStyles()

    return (
        <footer className={ classes.root }>
            <Paragraph>
                &copy; { new Date().getFullYear() }
            </Paragraph>
        </footer>
    )
}
