import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export async function analyzeImage(imageData, accessToken) {
  const formData = new FormData()

  if (typeof imageData === 'string') {
    // Base64 image from camera
    const blob = await fetch(imageData).then((r) => r.blob())
    formData.append('image', blob, 'capture.jpg')
  } else {
    // File upload
    formData.append('image', imageData)
  }

  const response = await api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Analysis failed')
  }

  return response.data.data
}

export async function getAnalysisResult(id, accessToken) {
  const response = await api.get(`/results/${id}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to fetch results')
  }

  return response.data.data
}

export async function getAnalysisHistory(accessToken, page = 1, limit = 10) {
  const response = await api.get(`/results?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to fetch history')
  }

  return response.data.data
}

export async function deleteAnalysisResult(id, accessToken) {
  const response = await api.delete(`/results/${id}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to delete result')
  }
}

export async function healthCheck() {
  try {
    const response = await api.get('/health')
    return response.status === 200
  } catch {
    return false
  }
}
