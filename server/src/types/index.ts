export interface FacialAnalysis {
  estimatedAge: number
  gender: 'male' | 'female'
  skinMetrics: SkinMetrics
  conditions: string[]
  facialLandmarks?: FacialLandmark[]
}

export interface SkinMetrics {
  hydration: number
  elasticity: number
  sunDamage: number
  agingSigns: number
  texture: number
  pigmentation: number
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
