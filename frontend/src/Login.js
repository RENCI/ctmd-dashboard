import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Paper } from '@material-ui/core'
import Page from './components/Layout/Page'
import Heading from './components/Typography/Heading'
import Paragraph from './components/Typography/Paragraph'
import LoginForm from './components/Forms/Login'
import ContinueToDashboard from './components/Forms/ContinueToDashboard'

import { AuthConsumer } from './contexts/AuthContext'

const styles = (theme) => ({
    container: {
        width: '100%',
        maxWidth: '480px',
        backgroundColor: theme.palette.common.white,
        margin: '0 auto',
        marginTop: 6 * theme.spacing.unit,
        paddingTop: 3 * theme.spacing.unit,
        paddingBottom: 3 * theme.spacing.unit,
    },
})

const loginPage = (props) => {
    const { classes } = props
    return (
        <AuthConsumer>
            {
                (context) => {
                    return (
                        <Page noMenu noFooter>
                        
                            <Paper className={ classes.container } elevation={ 1 }>
                                {
                                    context.authenticated === true
                                    ? <ContinueToDashboard logout={ context.logout }/>
                                    : <LoginForm login={ context.login }/>
                                }
                            </Paper>

                        </Page>
                    )
                }
            }
        </AuthConsumer>
    )
}

export default withStyles(styles)(loginPage)