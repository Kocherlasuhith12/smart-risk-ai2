import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

function upsertAccount(account) {
  try {
    const raw = localStorage.getItem('accounts')
    const accounts = raw ? JSON.parse(raw) : []
    const next = [
      account,
      ...accounts.filter(a => a?.email && a.email !== account.email),
    ].slice(0, 8)
    localStorage.setItem('accounts', JSON.stringify(next))
  } catch {
    // ignore storage errors
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (stored && token) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    const { access_token, user } = res.data
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
    upsertAccount({ name: user?.name, email: user?.email, role: user?.role })
    setUser(user)
    return user
  }

  const register = async (data) => {
    const res = await authAPI.register(data)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
