export interface FacialAnalysis {
  estimatedAge: number
  gender: 'male' | 'female'
  skinMetrics: SkinMetrics
  conditions: string[]
  facialLandmarks?: FacialLandmark[]
}

export interface SkinMetrics {
  hydration: number // 0-100
  elasticity: number // 0-100
  sunDamage: number // 0-100
  agingSigns: number // 0-100
  texture: number // 0-100
  pigmentation: number // 0-100
}

export interface FacialLandmark {
  type: string
  x: number
  y: number
}

export interface PeptideRecommendation {
  name: string
  description: string
  benefits: string[]
  usage?: string
  targetConditions: string[]
  priority: 'high' | 'medium' | 'low'
}

export interface AnalysisResult {
  id: string
  createdAt: string
  imageUrl?: string
  facialAnalysis: FacialAnalysis
  recommendations: PeptideRecommendation[]
  aiInsights: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
