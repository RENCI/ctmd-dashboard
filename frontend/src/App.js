import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Switch,  Route } from 'react-router-dom'
import PrivateRoute from './utils/PrivateRoute'
import { withStyles } from '@material-ui/core/styles'
import { AuthProvider } from './contexts/AuthContext'
import LoginPage from './Login'
import LogoutPage from './Logout'
import Dashboard from './Dashboard'

const drawerWidth = 240

const styles = (theme) => ({
    root: { },
})

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            authenticated: false,
            user: {
                name: 'Jane Doe',
                email: 'janedoe@email.com',
            },
            mobileOpen: false,
        }
    }
    
    updateLocalStorage = () => {
        localStorage.setItem('authenticated', this.state.authenticated);
    }
    
    loginHandler = () => {
        this.setState({ authenticated: true }, this.updateLocalStorage)
        console.log('Logged in!')
    }

    logoutHandler = () => {
        this.setState({ authenticated: false }, this.updateLocalStorage)
        console.log('Logged out!')
    }

    render() {
        return (
            <AuthProvider value={{
                authenticated: this.state.authenticated,
                user: this.state.user,
                login: this.loginHandler,
                logout: this.logoutHandler,
            }}>
                <Switch>
                    <Route exact path="/login" component={ LoginPage }/>
                    <Route exact path="/logout" component={ LogoutPage }/>
                    <PrivateRoute path="/" component={ Dashboard }/>
                    <PrivateRoute component={ LoginPage }/>
                </Switch>
            </AuthProvider>
        )
    }
}

App.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(App)