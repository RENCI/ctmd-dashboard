import React from 'react'
import { Switch,  Route } from 'react-router-dom'
import PrivateRoute from '../../utils/PrivateRoute'

import LoginPage from '../Login'
import LogoutPage from '../Logout'
import Dashboard from './Dashboard'

import { AuthConsumer } from '../../contexts/AuthContext'

const authPage = ({ match }) => {
    return (
        <AuthConsumer>
            {
                (context) => {
                    return (
                        <Switch>
                            <Route exact path={ `${ match.url }/login` } component={ LoginPage }/>
                            <Route exact path={ `${ match.url }/logout` } component={ LogoutPage }/>
                            <PrivateRoute path={ match.url } component={ Dashboard }/>
                            <PrivateRoute component={ Dashboard }/>
                        </Switch>
                    )
                }
            }
        </AuthConsumer>
    )
}

export default authPage