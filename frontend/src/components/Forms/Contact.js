import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Grid, TextField, Button } from '@material-ui/core'

const styles = (theme) => ({
    form: {
        margin: theme.spacing.unit,
    },
    textField: {
        // width: '100%',
    },
    formActions: {
        textAlign: 'right',
        display: 'flex',
        justifyContent: 'space-around',
        [theme.breakpoints.up('sm')]: {
            justifyContent: 'center',
        }
    },
    button: {
        flex: 1,
        '&:last-child': {
            marginLeft: 2 * theme.spacing.unit,
        },
        [theme.breakpoints.up('sm')]: {
            flex: '0 0 150px',
        }
    },
})

class contactForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            name: '',
            email: '',
            message: '',
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
                    <Grid item xs={ 12 } sm={ 6 }>
                        <TextField
                            label="Name"
                            className={ classes.textField }
                            value={ this.state.name }
                            onChange={ this.handleChange('name') }
                            variant="outlined"
                            fullWidth
                            margin="none"
                        />
                    </Grid>
                    <Grid item xs={ 12 } sm={ 6 }>
                        <TextField
                            label="Email"
                            className={ classes.textField }
                            value={ this.state.email }
                            onChange={ this.handleChange('email') }
                            variant="outlined"
                            fullWidth
                            margin="none"
                        />
                    </Grid>
                    <Grid item xs={ 12 }>
                        <TextField
                            label="Message"
                            placeholder="Enter your message here"
                            multiline
                            className={ classes.textField }
                            fullWidth
                            variant="outlined"
                            rows="4"
                        />
                    </Grid>
                    <Grid item xs={ 12 } className={ classes.formActions }>
                        <Button variant="outlined" color="secondary" className={ classes.button }>
                            Cancel
                        </Button>
                        <Button variant="outlined" color="primary" className={ classes.button }>
                            Submit
                        </Button>
                    </Grid>
                </Grid>
            </form>
        )
    }
}

export default withStyles(styles)(contactForm)