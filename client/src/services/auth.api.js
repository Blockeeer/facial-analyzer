import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: `${API_URL}/api/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Helper to manage refresh token in localStorage (fallback when cookies are blocked cross-domain)
const REFRESH_TOKEN_KEY = 'peptiscan_rt'

function saveRefreshToken(token) {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  }
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

function clearRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export const authApi = {
  async register(credentials) {
    try {
      const response = await api.post('/register', credentials)
      if (response.data?.data?.refreshToken) {
        saveRefreshToken(response.data.data.refreshToken)
      }
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data
      }
      return { success: false, error: 'Network error' }
    }
  },

  async login(credentials) {
    try {
      const response = await api.post('/login', credentials)
      if (response.data?.data?.refreshToken) {
        saveRefreshToken(response.data.data.refreshToken)
      }
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data
      }
      return { success: false, error: 'Network error' }
    }
  },

  async logout(accessToken) {
    try {
      const response = await api.post('/logout', {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      clearRefreshToken()
      return response.data
    } catch {
      clearRefreshToken()
      // Even if logout fails, we still want to clear local state
      return { success: true }
    }
  },

  async refresh() {
    try {
      // Send refresh token in body as fallback for when cookies are blocked
      const refreshToken = getRefreshToken()
      const response = await api.post('/refresh', { refreshToken })
      if (response.data?.data?.refreshToken) {
        saveRefreshToken(response.data.data.refreshToken)
      }
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data
      }
      return { success: false, error: 'Session expired' }
    }
  },

  async getMe(accessToken) {
    try {
      const response = await api.get('/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data
      }
      return { success: false, error: 'Failed to get user info' }
    }
  },

  async forgotPassword(email) {
    try {
      const response = await api.post('/forgot-password', { email })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data
      }
      return { success: false, error: 'Network error' }
    }
  },

  async resetPassword(token, password) {
    try {
      const response = await api.post('/reset-password', { token, password })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data
      }
      return { success: false, error: 'Network error' }
    }
  },

  async verifyEmail(token) {
    try {
      const response = await api.post('/verify-email', { token })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data
      }
      return { success: false, error: 'Network error' }
    }
  },

  async resendVerification(email) {
    try {
      const response = await api.post('/resend-verification', { email })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data
      }
      return { success: false, error: 'Network error' }
    }
  },
}
