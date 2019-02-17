import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { BrowserRouter as Router } from 'react-router-dom'
import Theme from './Theme'
import Dashboard from './Dashboard'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { ApiContext, endpoints } from './contexts/ApiContext'
const styles = (theme) => ({
    root: { },
})

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            authenticated: true,
        }
    }
    
    logout = () => {
        this.setState({ authenticated: false })
    }

    render() {
        return (
            <Router basename={ '' }>
                <ApiContext.Provider value={ endpoints }>
                    <MuiThemeProvider theme={ Theme }>
                        <Dashboard />
                    </MuiThemeProvider>
                </ApiContext.Provider>
            </Router>
        )
    }
}

App.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(App)