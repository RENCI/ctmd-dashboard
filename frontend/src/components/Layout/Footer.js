import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Grid } from '@material-ui/core'
import TextLink from '../Typography/TextLink'
import Container from './Container'

const styles = theme => ({
    root: {
        width: '100%',
        backgroundColor: theme.palette.grey[900],
        boxShadow: '0 -5px 15px 0 rgba(0,0,0,0.25)',
    },
    gridContainer: {
        flexGrow: 1,
    },
    gridItem: {
        padding: 2 * theme.spacing.unit,
        color: theme.palette.secondary.main,
        backgroundColor: 'transparent',
        opacity: '0.5',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        listStyleType: 'none',
        [theme.breakpoints.down('xs')]: {
            textAlign: 'center',
        },
    },
    link: {
        textDecoration: 'none',
        '&:hover': {
            color: theme.palette.common.white,
        }
    },
})

const siteLinks = [
    { text: 'About', href: 'about', },
    { text: 'Reports', href: 'reports', },
    { text: 'Dashboard', href: 'dashboard', },
    { text: 'Contact Us', href: 'contact', },
    { text: 'Follow Us on Twitter', href: 'http://twitter.com/Duke_CTSI', },
]

const industryLinks = [
    { text: 'NCATS', href: 'https://ncats.nih.gov/', },
    { text: 'NIH', href: 'https://www.nih.gov/', },
    { text: 'Trial Innovation Network', href: 'https://trialinnovationnetwork.org/', },
    { text: 'Duke CTSI', href: 'https://www.ctsi.duke.edu/', }
]

const externalLinks = [
    { text: 'Duke School of Medicine', href: 'https://medschool.duke.edu/', },
    { text: 'Duke University', href: 'https://duke.edu/', },
    { text: 'Duke Health', href: 'https://www.dukehealth.org/', },
]

const footer = ( props ) => {
    const { classes } = props
    const linkList = (list) => list.map(
        (link) => <TextLink
            className={ classes.link }
            to={ link.href }
            external={ link.href.startsWith('http://') }
        >{ link.text }</TextLink>
    )

    return (
        <footer className={ classes.root }>
            <Container>
                <Grid container spacing={ 0 } className={ classes.gridContainer }>
                    <Grid item xs={ 12 } sm={ 4 } className={ classes.gridItem }>
                        { linkList(siteLinks) }
                    </Grid>
                    <Grid item xs={ 12 } sm={ 4 } className={ classes.gridItem }>
                        { linkList(industryLinks) }
                    </Grid>
                    <Grid item xs={ 12 } sm={ 4 } className={ classes.gridItem }>
                        { linkList(externalLinks) }
                    </Grid>
                </Grid>
            </Container>
        </footer>
    )
}

export default withStyles(styles)(footer)