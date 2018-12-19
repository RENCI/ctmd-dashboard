import React, { Component } from 'react'
import axios from 'axios'
import { withStyles } from '@material-ui/core/styles'
import { AppBar, Tabs, Tab } from '@material-ui/core'
import { Paper } from '@material-ui/core';

const styles = theme => ({
    root: {},
    tabStrip: {
        backgroundColor: theme.palette.grey[200],
        color: theme.palette.primary.main,
    },
    tab: {},
    contents: {
        padding: 2 * theme.spacing.unit,
        overflowY: 'scroll',
        maxHeight: 'calc(100vh - 250px)'
    },
})

class ApprovedProposals extends Component {
    state = {
        value: 0,
        proposals: [],
    }
    
    endpoints = {
        0: `${ this.props.apiRoot }/proposals/approved/first-meeting/by-year`,
        1: `${ this.props.apiRoot }/proposals/approved/second-meeting/by-year`,
        2: `${ this.props.apiRoot }/proposals/approved/first-meeting/by-month`,
        3: `${ this.props.apiRoot }/proposals/approved/second-meeting/by-month`,
        4: `${ this.props.apiRoot }/proposals/approved/by-submitting-institution`,
        5: `${ this.props.apiRoot }/proposals/approved/by-assigned-institution`,
    }
    
    componentWillMount = this.fetchData
    
    async fetchData() {
        console.log(`Fetching data from ${this.endpoints[this.state.value]}`)
        await axios.get(this.endpoints[this.state.value])
            .then(response => {
                this.setState({ proposals: response.data })
            })
            .catch(error => {
                console.error(`Error fetching data\nError ${error.response.status}: ${error.response.statusText}`)
            })
    }

    handleChange = (event, value) => {
        this.setState({ value }, this.fetchData)
    }

    render() {
        const { value } = this.state
        const { classes } = this.props
        return (
            <div className={ classes.root }>
                <AppBar position="static" className={ classes.tabStrip }>
                    <Tabs fullWidth value={ value } onChange={ this.handleChange }>
                        <Tab className={ classes.tab } label="Approved in First Meeting" />
                        <Tab className={ classes.tab } label="Approved in Second Meeting" />
                        <Tab className={ classes.tab } label="Submitting Institution" />
                        <Tab className={ classes.tab } label="Assigned Institution" />
                    </Tabs>
                </AppBar>
                <Paper className={ classes.contents }>
                    <pre>
                        { JSON.stringify(this.state.proposals, null, 2) }
                    </pre>
                </Paper>
            </div>
        )
    }
}

export default withStyles(styles)(ApprovedProposals)