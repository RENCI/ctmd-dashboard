import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import Theme from './Theme'
import Dashboard from './Dashboard'
import api from './Api'
import { ThemeProvider } from '@material-ui/styles'
import { SettingsProvider } from './contexts/SettingsContext'
import { StoreProvider } from './contexts/StoreContext'
import { FlashMessageProvider } from './contexts/FlashMessageContext'

const App = props => {
    return (
        <ThemeProvider theme={ Theme }>
            <StoreProvider>
                <SettingsProvider>
                    <FlashMessageProvider>
                        <Router>
                            <Dashboard />
                        </Router>
                    </FlashMessageProvider>
                </SettingsProvider>
            </StoreProvider>
        </ThemeProvider>
    )
}

export default App