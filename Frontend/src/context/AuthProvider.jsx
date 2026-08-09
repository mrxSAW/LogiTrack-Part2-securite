import { useState } from 'react'

import api from '../api/axiosInstance'
import AuthContext from './AuthContext'

function getSavedUser() {
  const savedUser = localStorage.getItem('user')

  if (!savedUser) {
    return null
  }

  try {
    return JSON.parse(savedUser)
  } catch {
    localStorage.removeItem('user')
    localStorage.removeItem('token')

    return null
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(getSavedUser)

  async function login(credentials) {
    const response = await api.post(
      '/api/auth/login',
      credentials
    )

    const token = response.data.token
    const connectedUser = response.data.user

    localStorage.setItem('token', token)

    localStorage.setItem(
      'user',
      JSON.stringify(connectedUser)
    )

    setUser(connectedUser)

    return connectedUser
  }

  async function register(userData) {
    const response = await api.post(
      '/api/auth/register',
      userData
    )

    return response.data
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setUser(null)
  }

  function hasRole(...allowedRoles) {
    if (!user) {
      return false
    }

    return allowedRoles.includes(user.role)
  }

  const token = localStorage.getItem('token')

  const isAuthenticated =
    user !== null && token !== null

  const authValues = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    hasRole,
  }

  return (
    <AuthContext.Provider value={authValues}>
      {children}
    </AuthContext.Provider>
  )
}