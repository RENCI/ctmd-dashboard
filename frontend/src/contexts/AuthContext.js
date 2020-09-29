import React, { useEffect, useState } from 'react'
import { useLocalStorage } from '../hooks'

export const AuthContext = React.createContext({});

const emptyUser = {
    username: null,
    organization: null,
    access_level: null,
    first_name: null,
    last_name: null,
    email: null,
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState()
    const [localStorageUser, setLocalStorageUser] = useLocalStorage('ctmd-user')
    const validReferrer = document.referrer.includes('redcap.vanderbilt.edu') || process.env.NODE_ENV === 'development'

    const logout = () => {
        localStorage.removeItem('ctmd-user')
        window.location = 'https://redcap.vanderbilt.edu/plugins/TIN/user/login'
    }

    const authenticate = () => {
        if (validReferrer) {
            let userData = {}
            // get query params--should have `status`, `username`, `organization`, `access_level`, `first_name`, `last_name`, `email`
            const params = new URLSearchParams(window.location.search)
            for (let params of params.entries()) {
                userData[params[0]] = params[1]
            }
            console.log('userData')
            console.log(userData)
            // save user in local storage for later
            setLocalStorageUser(userData)
            // set active user in app for now
            setUser(userData)
        }
    }

    useEffect(() => {
        if (localStorageUser && localStorageUser.hasOwnProperty('username')) {
            setUser(localStorageUser)
        } else {
            authenticate()
        }
    }, [])

    return (
        <AuthContext.Provider value={{ user: user, logout: logout }}>
            { children }
        </AuthContext.Provider>
    )
}

