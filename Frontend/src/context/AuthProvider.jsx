import { useState } from 'react'
import api from '../api/axiosInstance'
import AuthContext from './AuthContext'

function recupererUtilisateur() {
  const utilisateurEnregistre = localStorage.getItem('user')

  if (!utilisateurEnregistre) { return null}

  try { return JSON.parse(utilisateurEnregistre) } 
  catch {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    return null
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(recupererUtilisateur)

  async function login(credentials) {
    const response = await api.post('/api/auth/login', credentials)
    const { token, user: utilisateur } = response.data

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(utilisateur))

    setUser(utilisateur)

    return utilisateur
  }

  async function register(donnees) {
    const response = await api.post('/api/auth/register', donnees)
    return response.data
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  function hasRole(...roles) {
    return user !== null && roles.includes(user.role)
  }

  const isAuthenticated =
    user !== null && localStorage.getItem('token') !== null

    return (
    <AuthContext.Provider
      value={{ user,isAuthenticated,login, register,logout,hasRole,}} >
      {children}
    </AuthContext.Provider>  )
}