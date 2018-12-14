import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Grid, FormControlLabel, TextField, Checkbox, Button } from '@material-ui/core'
import Paragraph from '../Typography/Paragraph'
import Subheading from '../Typography/Subheading'

const styles = (theme) => ({
    form: {
        margin: 3 * theme.spacing.unit,        
    },
    textField: {
        // width: '100%',
    },
    formActions: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 2 * theme.spacing.unit,
    },
    button: {
    },
})

class LoginForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            username: '',
            password: '',
        }
    }

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        })
    }

    render() {
        const { classes } = this.props
        return (
            <form className={ classes.form } noValidate autoComplete="off">
                <Grid container spacing={ 16 }>
                    <Grid item xs={ 12 } component={ Subheading }>
                        Login
                    </Grid>
                    <Grid item xs={ 12 } component={ Paragraph }>
                        Complete this form to access to the Dashboard.
                    </Grid>
                </Grid>
                <Grid container spacing={ 16 }>
                    <Grid item xs={ 12 }>
                        <TextField
                            label="Username"
                            className={ classes.textField }
                            value={ this.state.username }
                            onChange={ this.handleChange('username') }
                            variant="outlined"
                            margin="none"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={ 12 }>
                        <TextField
                            label="Password"
                            className={ classes.textField }
                            type="password"
                            // value={ this.state.password }
                            // onChange={ this.handleChange('psasword') }
                            variant="outlined"
                            margin="none"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={ 12 } className={ classes.formActions }>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={this.state.checkedB}
                                    onChange={this.handleChange('checkedB')}
                                    value="checkedB"
                                    color="primary"
                                />
                            }
                          label="Remember Me"
                        />
                        <Button
                            color="primary"
                            variant="outlined"
                            onClick={ this.props.login }
                        >
                            LOGIN
                        </Button>
                    </Grid>
                </Grid>
            </form>
        )
    }
}

export default withStyles(styles)(LoginForm)