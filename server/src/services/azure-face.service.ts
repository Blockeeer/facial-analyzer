import axios from 'axios'
import { FacialAnalysis, SkinMetrics } from '../types/index.js'

interface AzureFaceResponse {
  faceId: string
  faceRectangle: {
    top: number
    left: number
    width: number
    height: number
  }
  faceAttributes?: {
    age?: number
    gender?: string
    smile?: number
    facialHair?: {
      moustache: number
      beard: number
      sideburns: number
    }
    glasses?: string
    emotion?: {
      anger: number
      contempt: number
      disgust: number
      fear: number
      happiness: number
      neutral: number
      sadness: number
      surprise: number
    }
    blur?: {
      blurLevel: string
      value: number
    }
    exposure?: {
      exposureLevel: string
      value: number
    }
    noise?: {
      noiseLevel: string
      value: number
    }
    makeup?: {
      eyeMakeup: boolean
      lipMakeup: boolean
    }
    accessories?: Array<{
      type: string
      confidence: number
    }>
    occlusion?: {
      foreheadOccluded: boolean
      eyeOccluded: boolean
      mouthOccluded: boolean
    }
    hair?: {
      bald: number
      invisible: boolean
      hairColor: Array<{
        color: string
        confidence: number
      }>
    }
  }
  faceLandmarks?: Record<string, { x: number; y: number }>
}

class AzureFaceService {
  private endpoint: string
  private apiKey: string

  constructor() {
    this.endpoint = process.env.AZURE_FACE_ENDPOINT || ''
    this.apiKey = process.env.AZURE_FACE_KEY || ''
  }

  async analyzeFace(imageBuffer: Buffer): Promise<FacialAnalysis> {
    if (!this.endpoint || !this.apiKey) {
      // Return mock data if Azure credentials not configured
      console.warn('Azure Face API credentials not configured, using mock data')
      return this.getMockAnalysis()
    }

    try {
      const response = await axios.post<AzureFaceResponse[]>(
        `${this.endpoint}/face/v1.0/detect`,
        imageBuffer,
        {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Ocp-Apim-Subscription-Key': this.apiKey,
          },
          params: {
            returnFaceId: true,
            returnFaceLandmarks: true,
            returnFaceAttributes: 'age,gender,smile,facialHair,glasses,emotion,blur,exposure,noise,makeup,accessories,occlusion,hair',
            recognitionModel: 'recognition_04',
            detectionModel: 'detection_03',
          },
        }
      )

      if (response.data.length === 0) {
        throw new Error('No face detected in the image')
      }

      const face = response.data[0]
      return this.transformAzureResponse(face)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Azure Face API error:', error.response?.data)
        throw new Error('Failed to analyze face. Please try again.')
      }
      throw error
    }
  }

  private transformAzureResponse(face: AzureFaceResponse): FacialAnalysis {
    const attrs = face.faceAttributes

    // Calculate skin metrics based on Azure attributes
    const skinMetrics = this.calculateSkinMetrics(attrs)

    // Detect conditions based on the analysis
    const conditions = this.detectConditions(attrs, skinMetrics)

    return {
      estimatedAge: attrs?.age || 30,
      gender: (attrs?.gender as 'male' | 'female') || 'female',
      skinMetrics,
      conditions,
    }
  }

  private calculateSkinMetrics(attrs: AzureFaceResponse['faceAttributes']): SkinMetrics {
    // Calculate metrics based on blur, exposure, and noise values
    const blurValue = attrs?.blur?.value || 0.5
    const exposureValue = attrs?.exposure?.value || 0.5
    const noiseValue = attrs?.noise?.value || 0.5

    // Hydration: inversely related to noise (high noise = dry skin appearance)
    const hydration = Math.round((1 - noiseValue) * 100)

    // Elasticity: based on estimated age (younger = more elastic)
    const age = attrs?.age || 30
    const elasticity = Math.max(20, Math.round(100 - (age - 20) * 1.5))

    // Sun damage: based on exposure levels
    const sunDamage = Math.round(
      exposureValue > 0.5 ? (exposureValue - 0.5) * 200 : exposureValue * 40
    )

    // Aging signs: based on age and other factors
    const agingSigns = Math.min(100, Math.round((age - 20) * 2 + blurValue * 20))

    // Texture: inversely related to blur
    const texture = Math.round((1 - blurValue) * 100)

    // Pigmentation: based on exposure and age
    const pigmentation = Math.round(
      Math.min(100, exposureValue * 50 + (age > 40 ? (age - 40) * 1 : 0))
    )

    return {
      hydration: Math.max(0, Math.min(100, hydration)),
      elasticity: Math.max(0, Math.min(100, elasticity)),
      sunDamage: Math.max(0, Math.min(100, sunDamage)),
      agingSigns: Math.max(0, Math.min(100, agingSigns)),
      texture: Math.max(0, Math.min(100, texture)),
      pigmentation: Math.max(0, Math.min(100, pigmentation)),
    }
  }

  private detectConditions(
    attrs: AzureFaceResponse['faceAttributes'],
    metrics: SkinMetrics
  ): string[] {
    const conditions: string[] = []

    // Detect conditions based on metrics
    if (metrics.hydration < 40) {
      conditions.push('Dehydration')
    }
    if (metrics.sunDamage > 60) {
      conditions.push('Sun Damage')
    }
    if (metrics.agingSigns > 50) {
      conditions.push('Fine Lines')
    }
    if (metrics.agingSigns > 70) {
      conditions.push('Wrinkles')
    }
    if (metrics.elasticity < 50) {
      conditions.push('Loss of Firmness')
    }
    if (metrics.pigmentation > 50) {
      conditions.push('Uneven Skin Tone')
    }
    if (metrics.texture < 40) {
      conditions.push('Rough Texture')
    }

    // Additional conditions based on Azure attributes
    const age = attrs?.age || 30
    if (age > 35) {
      conditions.push('Collagen Loss')
    }

    return conditions
  }

  private getMockAnalysis(): FacialAnalysis {
    return {
      estimatedAge: 32,
      gender: 'female',
      skinMetrics: {
        hydration: 65,
        elasticity: 72,
        sunDamage: 35,
        agingSigns: 28,
        texture: 78,
        pigmentation: 25,
      },
      conditions: ['Mild Dehydration', 'Early Fine Lines', 'Minor Sun Exposure'],
    }
  }
}

export const azureFaceService = new AzureFaceService()
