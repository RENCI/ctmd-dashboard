import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import Theme from './Theme'
import Dashboard from './Dashboard'
import { ThemeProvider } from '@material-ui/styles'
import { SettingsProvider, StoreProvider, FlashMessageProvider } from './contexts'

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