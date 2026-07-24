import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    // Use 'auth_token' — matches client.js interceptor
    const token = localStorage.getItem('auth_token')
    if (!token) { setLoading(false); return }
    try {
      const me = await authAPI.getMe()
      setUser(me)
    } catch {
      localStorage.removeItem('auth_token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password })
    // Backend returns { access_token, token_type, user: { id, username, email, ... } }
    localStorage.setItem('auth_token', data.access_token)
    setUser(data.user)
    return data
  }

  const signup = async (username, email, password, fullName) => {
    const data = await authAPI.signup({
      username,
      email,
      password,
      full_name: fullName || undefined,
    })
    // Auto-login after signup
    localStorage.setItem('auth_token', data.access_token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
