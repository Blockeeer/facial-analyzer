import axios from 'axios'
import { AnalysisResult, ApiResponse } from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function analyzeImage(
  imageData: string | File
): Promise<AnalysisResult> {
  const formData = new FormData()

  if (typeof imageData === 'string') {
    // Base64 image from camera
    const blob = await fetch(imageData).then((r) => r.blob())
    formData.append('image', blob, 'capture.jpg')
  } else {
    // File upload
    formData.append('image', imageData)
  }

  const response = await api.post<ApiResponse<AnalysisResult>>(
    '/analyze',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Analysis failed')
  }

  return response.data.data
}

export async function getAnalysisResult(id: string): Promise<AnalysisResult> {
  const response = await api.get<ApiResponse<AnalysisResult>>(`/results/${id}`)

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to fetch results')
  }

  return response.data.data
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await api.get('/health')
    return response.status === 200
  } catch {
    return false
  }
}
