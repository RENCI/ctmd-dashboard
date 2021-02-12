import React, { useEffect, useState } from 'react'
import { useLocalStorage } from '../hooks'
import axios from 'axios'
import api from '../Api'

export const AuthContext = React.createContext({})

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
  const [localStorageUser, setLocalStorageUser] = useLocalStorage('ctmd-user-v2')
  const [authenticated, setAuthenticated] = useLocalStorage(false)
  const validReferrer = document.referrer.includes('redcap.vanderbilt.edu') || process.env.NODE_ENV === 'developments'

  const logout = () => {
    localStorage.removeItem('ctmd-user-v2')
    window.location = 'https://redcap.vanderbilt.edu/plugins/TIN'
  }

  const authenticate = () => {
    if (authenticated) {
      let userData = {}
      // get query params--should have `status`, `username`, `organization`, `access_level`, `first_name`, `last_name`, `email`
      const params = new URLSearchParams(window.location.search)
      for (let params of params.entries()) {
        userData[params[0]] = params[1]
      }

      // set auth status
      setAuthenticated(true)

      // save user in local storage for later
      setLocalStorageUser(userData)
      // set active user in app for now
      setUser(userData)
    }
  }

  useEffect(async () => {
    const response = await axios.get(api.authStatus, { withCredentials: true })
    const authenticated = response.data.authenticated
    if (authenticated) {
      setUser(localStorageUser)
    } else {
      authenticate()
    }
  }, [])

  return <AuthContext.Provider value={{ user: user, logout: logout }}>{children}</AuthContext.Provider>
}
