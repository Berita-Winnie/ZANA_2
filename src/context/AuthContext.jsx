/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest, clearToken, setToken } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = localStorage.getItem('zana_token')
        if (!token) {
          setUser(null)
          setProfile(null)
          setRole(null)
          return
        }

        const data = await apiRequest('/auth/me')
        setProfile(data.user)
        setUser({ uid: data.user.uid, email: data.user.email })
        setRole(data.user.role)
      } catch {
        clearToken()
        setUser(null)
        setProfile(null)
        setRole(null)
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [])

  const login = async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email, password },
    })
    setToken(data.token)
    setProfile(data.user)
    setUser({ uid: data.user.uid, email: data.user.email })
    setRole(data.user.role)
    return data
  }

  const register = async (email, password, fullName = '') => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      auth: false,
      body: { email, password, fullName },
    })
    setToken(data.token)
    setProfile(data.user)
    setUser({ uid: data.user.uid, email: data.user.email })
    setRole(data.user.role)
    return data
  }

  const logout = async () => {
    clearToken()
    setUser(null)
    setProfile(null)
    setRole(null)
  }

  const value = { user, profile, role, loading, login, register, logout }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

