import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { authApi } from '../services/auth.api'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshAuth = useCallback(async () => {
    try {
      const response = await authApi.refresh()
      if (response.success && response.data) {
        setAccessToken(response.data.accessToken)
        // Get user info
        const userResponse = await authApi.getMe(response.data.accessToken)
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data)
        }
      }
    } catch {
      setUser(null)
      setAccessToken(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshAuth()
  }, [refreshAuth])

  // Auto refresh token before expiry
  useEffect(() => {
    if (!accessToken) return

    // Refresh 1 minute before expiry (assuming 15 min expiry)
    const refreshInterval = setInterval(
      () => {
        refreshAuth()
      },
      14 * 60 * 1000 // 14 minutes
    )

    return () => clearInterval(refreshInterval)
  }, [accessToken, refreshAuth])

  const getErrorMessage = (error) => {
    if (!error) return null
    if (typeof error === 'string') return error
    if (error.message) return error.message
    return 'An error occurred'
  }

  const login = async (credentials) => {
    const response = await authApi.login(credentials)
    if (response.success && response.data) {
      setUser(response.data.user)
      setAccessToken(response.data.accessToken)
    } else {
      throw new Error(getErrorMessage(response.error) || 'Login failed')
    }
  }

  const register = async (credentials) => {
    const response = await authApi.register(credentials)
    if (response.success && response.data) {
      setUser(response.data.user)
      setAccessToken(response.data.accessToken)
    } else {
      throw new Error(getErrorMessage(response.error) || 'Registration failed')
    }
  }

  const logout = async () => {
    try {
      if (accessToken) {
        await authApi.logout(accessToken)
      }
    } finally {
      setUser(null)
      setAccessToken(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        isEmailVerified: user?.isEmailVerified ?? false,
        isLoading,
        login,
        register,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
