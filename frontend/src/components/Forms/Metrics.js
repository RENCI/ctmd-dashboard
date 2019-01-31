import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Grid, TextField, Button } from '@material-ui/core'

const styles = (theme) => ({
    form: {
        width: '100%',
        maxWidth: '1080px',
    },
    textField: {
        width: '100%',
    },
    button: {},
})

class MetricsForm extends Component {
    state = {
        siteNumber: '',
        siteName: '',
    }
    changeHandler = (name) => (event) => {
        this.setState({ [name]: event.target.value })
    }
    render() {
        const { classes } = this.props
        return (
            <form className={classes.container} noValidate autoComplete="off" className={ classes.form }>
                <Grid container spacing={ 16 }>
                    <Grid item xs={ 12 } md={ 6 }>
                        <TextField variant="outlined" margin="normal"
                            className={ classes.textField } id="site-number"
                            label="Site Number"
                            value={ this.state.name }
                            onChange={ this.changeHandler('name') }
                        />
                    </Grid>
                    <Grid item xs={ 12 } md={ 6 }>
                        <TextField variant="outlined" margin="normal"
                            className={ classes.textField } id="site-name"
                            label="Site Name"
                            value={ this.state.name }
                            onChange={ this.changeHandler('name') }
                        />
                    </Grid>
                    <Grid item xs={ 12 }>
                        <Button variant="contained" color="secondary" size="large" className={ classes.button }>
                            Submit
                        </Button>
                    </Grid>
                </Grid>
            </form>
        )
    }
}

export default withStyles(styles)(MetricsForm)