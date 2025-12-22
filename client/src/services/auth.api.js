import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: `${API_URL}/api/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export const authApi = {
  async register(credentials) {
    try {
      const response = await api.post('/register', credentials)
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
      return response.data
    } catch {
      // Even if logout fails, we still want to clear local state
      return { success: true }
    }
  },

  async refresh() {
    try {
      const response = await api.post('/refresh')
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
