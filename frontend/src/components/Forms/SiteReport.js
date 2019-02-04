import React, { Component, Fragment } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Grid, TextField } from '@material-ui/core'
import Subheading from '../Typography/Subheading'
import Paragraph from '../Typography/Paragraph'

const styles = (theme) => ({
    form: {
        width: '100%',
        maxWidth: '1080px',
        marginBottom: 4 * theme.spacing.unit,
    },
    textField: {
        width: '100%',
    },
    button: {},
})

class SiteReportForm extends Component {
    state = {
        siteId: '',
        siteName: '',
        matchedSite: null,
    }
    changeHandler = (name) => (event) => {
        this.setState({ [name]: event.target.value })
        if (name === 'siteId') {
            const foundSite = this.props.sites.find(site => site.id === parseInt(event.target.value))
            if (foundSite) {
                this.setState({
                    siteId: foundSite.id,
                    siteName: foundSite.name,
                    matchedSite: foundSite,
                })
            } else {
                this.setState({
                    siteName: '',
                    matchedSite: null,
                })
            }
        }
    }
    render() {
        const { classes } = this.props
        const { matchedSite } = this.state
        return (
            <Fragment>
                <form className={ classes.form } noValidate autoComplete="off">
                    <Grid container spacing={ 16 }>
                        <Grid item xs={ 12 } sm={ 3 }>
                            <TextField variant="outlined" margin="normal"
                                className={ classes.textField } id="site-number"
                                label="Site Number"
                                value={ this.state.siteId }
                                onChange={ this.changeHandler('siteId') }
                                autoFocus={ true }
                            />
                        </Grid>
                        <Grid item xs={ 12 } sm={ 9 }>
                            <TextField variant="outlined" margin="normal"
                                className={ classes.textField } id="site-name"
                                label="Site Name"
                                value={ this.state.siteName }
                                InputProps={{ readOnly: this.state.matchedSite !== null }}
                                error={ this.state.siteId !== '' && !this.state.matchedSite && !this.state.siteName }
                                onChange={ this.changeHandler('siteName') }
                            />
                        </Grid>
                    </Grid>
                </form>
                {
                    this.state.matchedSite !== null ? (
                        <div>
                            <Subheading>{ matchedSite.name } ({ matchedSite.id })</Subheading>
                            <Paragraph>{ matchedSite.details }</Paragraph>
                        </div>
                    ) : (
                        <div>
                            No matching site.
                        </div>
                    )
                }
            </Fragment>
        )
    }
}

export default withStyles(styles)(SiteReportForm)