import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import Theme from './Theme'
import Dashboard from './Dashboard'
import { ThemeProvider } from '@material-ui/styles'
import { AuthProvider, SettingsProvider, StoreProvider, FlashMessageProvider } from './contexts'

const App = props => {
    return (
        <AuthProvider>
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
        </AuthProvider>
    )
}

export default App