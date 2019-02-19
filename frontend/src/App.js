import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { BrowserRouter as Router } from 'react-router-dom'
import Theme from './Theme'
import Dashboard from './Dashboard'
import { ThemeProvider } from '@material-ui/styles'
import { ApiContext, endpoints } from './contexts/ApiContext'

const App = props => {
    return (
        <Router basename={ '' }>
            <ApiContext.Provider value={ endpoints }>
                <ThemeProvider theme={ Theme }>
                    <Dashboard />
                </ThemeProvider>
            </ApiContext.Provider>
        </Router>
    )
}

export default App