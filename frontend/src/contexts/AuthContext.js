import React from 'react'

const AuthContext = React.createContext({});

export const AuthProvider = AuthContext.Provider
export const AuthConsumer = AuthContext.Consumer