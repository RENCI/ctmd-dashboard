import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Paragraph } from '../Typography'

const useStyles = makeStyles(theme => ({
    root: {
        padding: `${ theme.spacing(8) }px ${ theme.spacing(4) }px`,
        marginLeft: '5rem',
    }
}))

export const Footer = props => {
    const classes = useStyles()
    const [branch, setBranch] = useState('...')

    return (
        <footer className={ classes.root }>
            <Paragraph>
                This application was developed by the Translational Science Team at <a href="https://www.renci.org/" target="_blank" rel="noopener noreferrer">RENCI</a>.
            </Paragraph>
        </footer>
    )
}
