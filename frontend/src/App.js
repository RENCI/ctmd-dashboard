import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Switch,  Route } from 'react-router-dom'
import PrivateRoute from './utils/PrivateRoute'
import { withStyles } from '@material-ui/core/styles'
import { AuthProvider } from './contexts/AuthContext'
import Dashboard from './Dashboard'

import { BrowserRouter as Router } from 'react-router-dom'
import Theme from './Theme'
import { MuiThemeProvider } from '@material-ui/core/styles'

const drawerWidth = 240

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