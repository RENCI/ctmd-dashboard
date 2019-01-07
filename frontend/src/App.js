import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { AuthProvider } from './contexts/AuthContext'
import Dashboard from './Dashboard'

import { BrowserRouter as Router } from 'react-router-dom'
import Theme from './Theme'
import { MuiThemeProvider } from '@material-ui/core/styles'

const styles = (theme) => ({
    root: { },
})

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            authenticated: false,
        }
    }
    
    render() {
        return (
            <Router basename={ '' }>
                <MuiThemeProvider theme={ Theme }>
                    <AuthProvider value={{ authenticated: this.state.authenticated }}>
                        <Dashboard />
                    </AuthProvider>
                </MuiThemeProvider>
            </Router>
        )
    }
}

App.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(App)