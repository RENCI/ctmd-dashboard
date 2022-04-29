import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import Theme from './Theme'
import Dashboard from './Dashboard'
import { ThemeProvider } from '@material-ui/styles'
import { AuthProvider, SettingsProvider, StoreProvider, FlashMessageProvider } from './contexts'
import Analytics from 'react-ga4'

const TRACKING_ID = process.env.REACT_APP_GA4_TRACKING_ID || ''
Analytics.initialize(TRACKING_ID)

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