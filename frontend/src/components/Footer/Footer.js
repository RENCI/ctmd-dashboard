import React, { useEffect, useState } from 'react'
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
                This application is developed by the Translational Science Team at <a href="https://www.renci.org/" target="_blank" rel="noopener noreferrer">RENCI</a>.
            </Paragraph>
        </footer>
    )
}
