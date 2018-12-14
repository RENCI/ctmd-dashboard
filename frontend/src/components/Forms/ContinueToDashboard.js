import React from 'react'
import { Link } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import { Grid, Button } from '@material-ui/core'
import { ExitToApp as ExitToAppIcon, Dashboard as DashboardIcon } from '@material-ui/icons'
import Paragraph from '../Typography/Paragraph'
import Subheading from '../Typography/Subheading'

const styles = (theme) => ({
    form: {
        margin: 3 * theme.spacing.unit,        
    },
    formActions: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: 'column',
    },
    button: {
        textAlign: 'center',
        flex: 1,
        margin: theme.spacing.unit,
    },
    buttonIcon: {
        marginRight: theme.spacing.unit,
    }
})

const continueForm = (props) => {
    const { classes } = props
    return (
        <form className={ classes.form }>
            <Grid container spacing={ 16 }>
                <Grid item xs={ 12 } component={ Subheading }>
                    Login
                </Grid>
                <Grid item xs={ 12 } component={ Paragraph }>
                    You are logged in!
                </Grid>
                <Grid item xs={ 12 } className={ classes.formActions }>
                    <Button variant="outlined" color="primary"
                        component={ Link } to="/dashboard"
                        className={ classes.button }
                    >
                        <DashboardIcon className={ classes.buttonIcon }/>Continue to Dashboard
                    </Button>
                    <Button variant="outlined" color="secondary"
                        component={ Link } to="/dashboard/logout"
                        onClick={ props.logout } className={ classes.button }
                    >
                        <ExitToAppIcon className={ classes.buttonIcon }/>Logout
                    </Button>
                </Grid>
            </Grid>
        </form>
    )
}

export default withStyles(styles)(continueForm)