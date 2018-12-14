import React, { Component } from 'react'
import { Switch,  Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'

import LandingPage from './views/Index'
import AboutPage from './views/About'
import StartProposalPage from './views/StartProposal'
import ReportsPage from './views/Reports'
import ContactPage from './views/Contact'

import Auth from './views/Dashboard/Auth'

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            authenticated: false,
            user: {
                name: 'Jane Doe',
                email: 'janedoe@email.com',
            }
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

    componentWillMount = () => {
        const authState = localStorage.getItem('authenticated') === 'true' ? true : false
        this.setState({
            authenticated: authState,
        })
        console.log(
            localStorage.getItem('authenticated') === 'true'
            ? "You are already logged in."
            : "You are not logged in.")
    }

    authenticationChecker = () => {
        return this.state.authenticated
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
                    <Route exact path="/" component={ Auth }/>
                    <Route path="/about" component={ AboutPage }/>
                    <Route path="/start-proposal" component={ StartProposalPage }/>
                    <Route path="/reports" component={ ReportsPage }/>
                    <Route path="/contact" component={ ContactPage }/>
                    <Route path="/dashboard" component={ Auth }/>
                    <Route path="/home" component={ LandingPage }/>
                </Switch>
            </AuthProvider>
        )
    }
}

export default App