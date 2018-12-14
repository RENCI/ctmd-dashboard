import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Container from './Container'
import Header from './Header'
import Footer from './Footer'
import Menu from './Menu/MainMenu'
import DashboardFab from '../Dashboard/Fab'

const styles = (theme) => ({
    main: {
        flex: 1,
        padding: 4 * theme.spacing.unit,
        transition: 'padding 250ms',
        [theme.breakpoints.down('xs')]: {
            padding: 2 * theme.spacing.unit
        },
    },
})

const page = (props) => {
    const { classes } = props
    return (
        <Fragment>
            <div className={ classes.main }>
                <Container>
                    <Header />
                    {
                        props.noMenu
                        ? null
                        : <Menu />
                    }
                    { props.children }
                </Container>
            </div>
            {
                props.noFooter
                ? null
                : <Footer />
            }
            <DashboardFab />
        </Fragment>
    )
}

page.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(page)