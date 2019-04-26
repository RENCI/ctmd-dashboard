import React from 'react';
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom'

const useStyles = makeStyles(theme => ({
    title: {},
    heading: {
        margin: 0,
        marginBottom: 4 * theme.spacing.unit,
        transition: 'margin 250ms',
        [theme.breakpoints.up('sm')]: {
            margin: `0 ${ 2 * theme.spacing.unit } ${ 2 * theme.spacing.unit } ${ 2 * theme.spacing.unit }`,
        }
    },
    subheading: {},
    paragraph: {
        color: theme.palette.grey[700],
        margin: theme.spacing.unit,
    },
    textlink: {
        color: theme.palette.secondary.main,
        transition: 'color 250ms',
        '&:hover': {
            color: theme.palette.primary.main,
        }
    },
}))

export const Title = props => {
    const { children } = props
    const classes = useStyles()
    return (
        <Typography variant="h1" className={ classes.heading }>
            { children }
        </Typography>
    )
}

export const Heading = props => {
    const { children } = props
    const classes = useStyles()
    return (
        <Typography variant="h2" className={ classes.heading }>
            { children }
        </Typography>
    )
}

export const Subheading = props => {
    const { children } = props
    const classes = useStyles()
    return (
        <Typography variant="h3" className={ classes.subheading }>
            { children }
        </Typography>
    )
}

export const Paragraph = props => {
    const { children } = props
    const classes = useStyles()
    return (
        <Typography paragraph className={ classes.paragraph }>
            { children }
        </Typography>
    )
}

export const TextLink = props => {
    const { children } = props
    const classes = useStyles()
    return (
        <Link
            to={ props.to }
            className={ classes.textLink }
            target={ props.external ? '_blank' : '_top' }
        >
            { children }
        </Link>
    )
}