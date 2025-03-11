import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { AuthConsumer } from '../contexts/AuthContext'

export const privateRoute = ({ component: Component, ...rest }) => {
    return (
        <AuthConsumer>
            {
                (context) => {
                    return (
                        <Route { ...rest }
                            render={
                                (props) => {
                                    return (
                                        context.authenticated === true
                                        ? <Component { ...props }/>
                                        : <Redirect to="/login"/>
                                    )
                                }
                            }
                        />
                    )
                }
            }
        </AuthConsumer>
    )
}
