/**
 * AuthContext — 简化单用户模式 (adapted from RDSE2)
 */
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { BASE_URL } from '../api/client'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  isSetup: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSetup, setIsSetup] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        // Check if setup is done
        const statusRes = await fetch(`${BASE_URL}/auth/status`)
        const statusData = await statusRes.json()
        setIsSetup(statusData.isSetup)

        // Check existing token
        const token = localStorage.getItem('eb_token')
        if (token) {
          const meRes = await fetch(`${BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (meRes.ok) {
            setIsAuthenticated(true)
          } else {
            localStorage.removeItem('eb_token')
          }
        }
      } catch {
        // Server not ready
      }
      setIsLoading(false)
    }
    init()
  }, [])

  const login = useCallback((token: string) => {
    localStorage.setItem('eb_token', token)
    setIsAuthenticated(true)
    setIsSetup(true)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('eb_token')
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, isSetup, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
