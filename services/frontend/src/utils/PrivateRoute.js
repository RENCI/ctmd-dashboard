import React from 'react'
import { Navigate } from 'react-router-dom'
import { AuthConsumer } from '../contexts/AuthContext'

export const privateRoute = ({ component: Component, ...rest }) => {
    return (
        <AuthConsumer>
            {
                (context) => {
                    return (
                        context.authenticated === true
                        ? <Component { ...rest }/>
                        : <Navigate to="/login" replace />
                    )
                }
            }
        </AuthConsumer>
    )
}
