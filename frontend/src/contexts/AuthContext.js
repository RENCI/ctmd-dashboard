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
  const [authenticated, setAuthenticated] = useState(false)
  const validReferrer = document.referrer.includes('redcap.vanderbilt.edu') || process.env.NODE_ENV === 'developments'

  const logout = () => {
    localStorage.removeItem('ctmd-user-v2')
    window.location = 'https://redcap.vanderbilt.edu/plugins/TIN'
  }

  //   const authenticate = (auth_response) => {
  //     if (auth_response && validReferrer) {
  //       //   let userData = {}
  //       //   // get query params--should have `status`, `username`, `organization`, `access_level`, `first_name`, `last_name`, `email`
  //       //   const params = new URLSearchParams(window.location.search)
  //       //   for (let params of params.entries()) {
  //       //     userData[params[0]] = params[1]
  //       //   }

  //       // set auth status
  //       setAuthenticated(true)
  //       // save user in local storage for later
  //       setLocalStorageUser(auth_response)
  //       // set active user in app for now
  //       setUser(auth_response)
  //     }
  //   }

  useEffect(async () => {
    const response = await axios.get(api.authStatus, { withCredentials: true })
    const data = response.data.auth_info

    if (Object.keys(data)) {
      setUser(data)
      setLocalStorageUser(data)
      setAuthenticated(response.data.auth_info.authenticated)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user: user, authenticated: authenticated, logout: logout }}>
      {children}
    </AuthContext.Provider>
  )
}
