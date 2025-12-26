import axios from 'axios'
import FormData from 'form-data'
import sharp from 'sharp'

class AILabService {
  constructor() {
    this.endpoint = 'https://www.ailabapi.com/api/portrait/analysis/skin-analysis'
  }

  getApiKey() {
    return process.env.AILAB_API_KEY || ''
  }

  async prepareImage(imageBuffer) {
    // AILab API ONLY accepts JPEG/JPG and has size limits
    console.log('🔄 Preparing image for AILab API...')

    // Get original dimensions
    const metadata = await sharp(imageBuffer).metadata()
    console.log(`📐 Original dimensions: ${metadata.width} x ${metadata.height}`)

    // Build sharp pipeline
    let pipeline = sharp(imageBuffer).rotate() // Auto-rotate based on EXIF

    // AILab API fails on large images - resize if larger than 2048px
    const MAX_DIMENSION = 2048
    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      console.log(`📏 Resizing to max ${MAX_DIMENSION}px...`)
      pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside' })
    }

    // Convert to JPEG
    const jpegBuffer = await pipeline.jpeg({ quality: 90 }).toBuffer()

    const newMetadata = await sharp(jpegBuffer).metadata()
    console.log(`✅ Image prepared: ${metadata.width}x${metadata.height} -> ${newMetadata.width}x${newMetadata.height}, ${jpegBuffer.length} bytes`)

    return jpegBuffer
  }

  async analyzeFace(imageBuffer) {
    const apiKey = this.getApiKey()

    if (!apiKey) {
      console.warn('⚠️  AILab API key not configured, using mock data')
      return this.getMockAnalysis()
    }

    console.log('🔑 AILab API key found:', apiKey.substring(0, 10) + '...')

    try {
      console.log('🔄 Analyzing skin with AILab Tools API...')
      console.log(`📍 Endpoint: ${this.endpoint}`)

      // Convert image to JPEG (AILab API only accepts JPEG)
      const jpegBuffer = await this.prepareImage(imageBuffer)

      // Create form data with image
      const formData = new FormData()
      formData.append('image', jpegBuffer, {
        filename: 'face.jpg',
        contentType: 'image/jpeg',
      })

      const response = await axios.post(this.endpoint, formData, {
        headers: {
          'ailabapi-api-key': apiKey,
          ...formData.getHeaders(),
        },
        timeout: 30000,
      })

      console.log('📥 AILab API Response Status:', response.status)
      console.log('📥 AILab API Response:', JSON.stringify(response.data, null, 2))

      // Check for API errors
      if (response.data.error_code && response.data.error_code !== 0) {
        console.error('❌ AILab API error:', response.data.error_msg)
        throw new Error(response.data.error_msg || 'Skin analysis failed')
      }

      console.log('✅ AILab skin analysis complete')
      return this.transformResponse(response.data)

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const errorData = error.response?.data
        const errorMsg = errorData?.error_msg || errorData?.message || error.message

        console.error('❌ AILab API error status:', status)
        console.error('❌ AILab API error data:', JSON.stringify(errorData, null, 2))

        if (status === 401 || status === 403) {
          throw new Error('Invalid AILab API key. Please check your credentials.')
        } else if (status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.')
        } else if (status === 400) {
          // Provide more specific error messages based on error code
          const errorCode = errorData?.error_code_str || ''
          if (errorCode === 'PROCESSING_FAILURE' || errorMsg === 'Processing failed.') {
            throw new Error('No face detected in the image. Please upload a clear face photo with good lighting.')
          }
          throw new Error('Invalid image. Please upload a clear face photo.')
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Analysis timed out. Please try again.')
        }

        throw new Error(`Skin analysis failed: ${errorMsg}`)
      }
      console.error('❌ Unexpected error:', error)
      throw error
    }
  }

  transformResponse(data) {
    console.log('🔄 [SkinAnalysis] Transforming response...')

    // AILab response structure: { error_code: 0, result: { ... } }
    const result = data.result || data.data || data

    // Log the structure we're working with
    console.log('📊 [SkinAnalysis] Result keys:', Object.keys(result))

    // Extract skin metrics from AILab response
    const skinMetrics = this.extractSkinMetrics(result)
    const conditions = this.detectConditions(result, skinMetrics)

    // Generate detailed issues with descriptions
    const mainIssues = this.generateMainIssues(result, skinMetrics)

    // Generate achievements (what's already good)
    const achievements = this.generateAchievements(result, skinMetrics)

    // Note: Age and gender are now detected by the separate Face Analyzer API
    const transformedResult = {
      skinMetrics,
      conditions,
      mainIssues,
      achievements,
      overallScore: this.calculateOverallScore(skinMetrics),
    }

    console.log('✅ [SkinAnalysis] Transformed result:', JSON.stringify(transformedResult, null, 2))
    return transformedResult
  }

  generateMainIssues(result, metrics) {
    const issues = []

    // Helper to get severity value (0-3)
    const getSeverity = (key) => {
      const item = result[key]
      if (item && typeof item === 'object') {
        return { value: item.value || 0, confidence: item.confidence || 0 }
      }
      return { value: 0, confidence: 0 }
    }

    // Check for texture/pore issues
    if (metrics.texture < 70) {
      const poreData = Math.max(
        getSeverity('pores_forehead').value,
        getSeverity('pores_left_cheek').value,
        getSeverity('pores_right_cheek').value,
        getSeverity('pores_jaw').value
      )
      issues.push({
        title: 'Skin Texture',
        description: poreData >= 1
          ? 'Visible pores and uneven texture detected. This can affect overall skin smoothness and appearance.'
          : 'Minor texture irregularities present. Skin could benefit from gentle exfoliation.',
        severity: poreData >= 2 ? 'high' : poreData >= 1 ? 'medium' : 'low',
        area: 'texture',
      })
    }

    // Check for pigmentation/dark circles
    const darkCircle = getSeverity('dark_circle')
    if (darkCircle.value >= 1 || metrics.pigmentation > 30) {
      issues.push({
        title: 'Under-eye Area',
        description: darkCircle.value >= 2
          ? 'Noticeable dark circles present under the eyes, which may indicate fatigue or genetics.'
          : 'Subtle dark circles or slight hollowness detected under the eyes.',
        severity: darkCircle.value >= 2 ? 'high' : 'medium',
        area: 'undereye',
      })
    }

    // Check for acne/blemishes
    const acne = getSeverity('acne')
    const blackhead = getSeverity('blackhead')
    if (acne.value >= 1 || blackhead.value >= 1) {
      issues.push({
        title: 'Blemishes & Breakouts',
        description: acne.value >= 2
          ? 'Active acne and blemishes detected. A targeted skincare routine is recommended.'
          : 'Minor blemishes present. Maintaining a good cleansing routine will help.',
        severity: acne.value >= 2 ? 'high' : 'medium',
        area: 'acne',
      })
    }

    // Check for aging signs
    const nasolabial = getSeverity('nasolabial_fold')
    const foreheadWrinkle = getSeverity('forehead_wrinkle')
    const eyePouch = getSeverity('eye_pouch')
    const crowsFeet = getSeverity('crows_feet')

    if (metrics.agingSigns > 25) {
      const maxAgingSign = Math.max(nasolabial.value, foreheadWrinkle.value, eyePouch.value, crowsFeet.value)
      let description = ''
      if (nasolabial.value >= 1) description = 'Nasolabial folds (smile lines) are becoming visible, a common early sign of aging.'
      else if (eyePouch.value >= 1) description = 'Mild puffiness or bags under the eyes detected.'
      else if (foreheadWrinkle.value >= 1) description = 'Early forehead lines detected. Consider anti-aging preventive care.'
      else description = 'Early signs of aging detected. Prevention is key at this stage.'

      issues.push({
        title: 'Early Aging Signs',
        description,
        severity: maxAgingSign >= 2 ? 'high' : maxAgingSign >= 1 ? 'medium' : 'low',
        area: 'aging',
      })
    }

    // Check for skin spots/sun damage
    const skinSpot = getSeverity('skin_spot')
    const mole = getSeverity('mole')
    if (skinSpot.value >= 1 || metrics.sunDamage > 30) {
      issues.push({
        title: 'Sun Damage & Spots',
        description: skinSpot.value >= 2
          ? 'Visible sun spots or hyperpigmentation detected. Sun protection is essential.'
          : 'Minor sun exposure signs present. Daily SPF is recommended.',
        severity: skinSpot.value >= 2 ? 'high' : 'medium',
        area: 'sundamage',
      })
    }

    // Check hydration
    if (metrics.hydration < 60) {
      issues.push({
        title: 'Skin Hydration',
        description: metrics.hydration < 40
          ? 'Skin appears dehydrated. Increased hydration and moisturizing products recommended.'
          : 'Skin could benefit from additional hydration for a healthier glow.',
        severity: metrics.hydration < 40 ? 'high' : 'medium',
        area: 'hydration',
      })
    }

    // Sort by severity (high first)
    const severityOrder = { high: 0, medium: 1, low: 2 }
    issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    return issues.slice(0, 4) // Return top 4 issues
  }

  generateAchievements(result, metrics) {
    const achievements = []

    // Helper to get severity value
    const getSeverity = (key) => {
      const item = result[key]
      return item && typeof item === 'object' ? item.value || 0 : 0
    }

    // Pepmax-style achievement categories

    // Fix Skin - Good skin condition (no acne, good texture)
    if (getSeverity('acne') === 0 && getSeverity('blackhead') === 0 && metrics.texture >= 70) {
      achievements.push({
        title: 'Fix Skin',
        description: 'Your skin is clear with good texture and no active blemishes.',
        icon: 'sparkles',
      })
    }

    // Reduce Aging - Minimal aging signs
    if (metrics.agingSigns <= 30 && metrics.elasticity >= 70) {
      achievements.push({
        title: 'Reduce Aging',
        description: 'Minimal signs of aging with good skin elasticity maintained.',
        icon: 'clock',
      })
    }

    // Improve Hair - Good overall skin health (indicates healthy lifestyle)
    if (metrics.hydration >= 65 && metrics.texture >= 70) {
      achievements.push({
        title: 'Improve Hair',
        description: 'Good hydration and skin health indicate a healthy foundation.',
        icon: 'trending-up',
      })
    }

    // Even Skin Tone - No pigmentation issues
    if (metrics.pigmentation <= 25 && getSeverity('dark_circle') === 0) {
      achievements.push({
        title: 'Even Skin Tone',
        description: 'Uniform skin tone with no visible dark spots or discoloration.',
        icon: 'sun',
      })
    }

    // Add Bonemass - Good facial structure (elasticity as proxy)
    if (metrics.elasticity >= 75) {
      achievements.push({
        title: 'Add Bonemass',
        description: 'Good facial structure and skin firmness detected.',
        icon: 'shield',
      })
    }

    // Always include at least one achievement
    if (achievements.length === 0) {
      achievements.push({
        title: 'Fix Skin',
        description: 'Your skin has potential for improvement with the right peptide routine.',
        icon: 'star',
      })
    }

    return achievements.slice(0, 3) // Return top 3 achievements (Pepmax style)
  }

  calculateOverallScore(metrics) {
    // Weight each metric for overall score
    const weights = {
      hydration: 0.15,
      elasticity: 0.20,
      texture: 0.20,
      pigmentation: 0.15,
      sunDamage: 0.15,
      agingSigns: 0.15,
    }

    // For sunDamage, agingSigns, pigmentation - lower is better, so we invert
    const score =
      metrics.hydration * weights.hydration +
      metrics.elasticity * weights.elasticity +
      metrics.texture * weights.texture +
      (100 - metrics.pigmentation) * weights.pigmentation +
      (100 - metrics.sunDamage) * weights.sunDamage +
      (100 - metrics.agingSigns) * weights.agingSigns

    return Math.round(score)
  }

  extractSkinMetrics(result) {
    // AILab skin analysis response format: { key: { value: 0-3, confidence: 0-1 } }
    // value: 0=none, 1=mild, 2=moderate, 3=severe

    const skinData = result

    // Helper to get severity value (0-3) and convert to percentage (0-100)
    const getSeverity = (...keys) => {
      for (const key of keys) {
        const item = skinData[key]
        if (item && typeof item === 'object' && item.value !== undefined) {
          // Convert 0-3 scale to 0-100 (0=0, 1=33, 2=67, 3=100)
          return item.value * 33.33
        }
      }
      return 0
    }

    // Get wrinkle scores from various wrinkle-related fields
    const foreheadWrinkle = getSeverity('forehead_wrinkle')
    const eyeFinelines = getSeverity('eye_finelines')
    const crowsFeet = getSeverity('crows_feet')
    const nasolabialFold = getSeverity('nasolabial_fold')
    const glabellaWrinkle = getSeverity('glabella_wrinkle')

    // Combine wrinkle scores (average of non-zero values or max)
    const wrinkleScores = [foreheadWrinkle, eyeFinelines, crowsFeet, nasolabialFold, glabellaWrinkle]
    const wrinkle = Math.max(...wrinkleScores)

    // Get pore scores
    const poresForehead = getSeverity('pores_forehead')
    const poresLeftCheek = getSeverity('pores_left_cheek')
    const poresRightCheek = getSeverity('pores_right_cheek')
    const poresJaw = getSeverity('pores_jaw')
    const pore = Math.max(poresForehead, poresLeftCheek, poresRightCheek, poresJaw)

    // Get other skin issues
    const acne = getSeverity('acne')
    const darkCircle = getSeverity('dark_circle')
    const eyePouch = getSeverity('eye_pouch')
    const spot = getSeverity('skin_spot')
    const blackhead = getSeverity('blackhead')
    const mole = getSeverity('mole')

    // Get skin type (0=oily, 1=dry, 2=normal, 3=combination)
    const skinType = skinData.skin_type?.skin_type || 2

    console.log('📊 AILab skin scores:', {
      wrinkle,
      pore,
      acne,
      darkCircle,
      eyePouch,
      spot,
      blackhead,
      skinType,
      nasolabialFold
    })

    // Convert to our metrics (0-100 scale)
    // Higher values = worse condition for these metrics
    const agingSigns = Math.min(100, Math.round(wrinkle * 0.6 + nasolabialFold * 0.2 + eyePouch * 0.2))
    const texture = Math.round(Math.max(0, 100 - pore * 0.5 - acne * 0.3 - blackhead * 0.2))
    const elasticity = Math.round(Math.max(0, 100 - wrinkle * 0.6 - nasolabialFold * 0.4))
    const sunDamage = Math.min(100, Math.round(spot * 0.7 + mole * 0.3))
    const pigmentation = Math.min(100, Math.round(spot * 0.5 + darkCircle * 0.3 + acne * 0.2))

    // Hydration based on skin type (dry = low hydration)
    let hydration = 70 // default normal
    if (skinType === 1) hydration = 40 // dry
    else if (skinType === 0) hydration = 85 // oily (excess sebum but not dehydrated)
    else if (skinType === 3) hydration = 60 // combination
    // Adjust based on other factors
    hydration = Math.round(Math.max(0, Math.min(100, hydration - acne * 0.1 - pore * 0.1)))

    return {
      hydration,
      elasticity,
      sunDamage,
      agingSigns,
      texture,
      pigmentation,
    }
  }

  getScore(data, ...keys) {
    if (!data || typeof data !== 'object') return null

    for (const key of keys) {
      const value = data[key]
      if (value !== undefined && value !== null) {
        // Handle different response formats
        if (typeof value === 'number') {
          return value
        }
        if (typeof value === 'object') {
          if (value.value !== undefined) return value.value
          if (value.score !== undefined) return value.score
          if (value.level !== undefined) return value.level * 20 // Convert 0-5 to 0-100
          if (value.confidence !== undefined) return value.confidence * 100
        }
        if (typeof value === 'string') {
          const num = parseFloat(value)
          if (!isNaN(num)) return num
        }
      }
    }
    return null
  }

  detectConditions(result, metrics) {
    const conditions = []

    // Helper to get severity value (0-3)
    const getSeverityValue = (key) => {
      const item = result[key]
      if (item && typeof item === 'object' && item.value !== undefined) {
        return item.value
      }
      return 0
    }

    // Based on calculated metrics
    if (metrics.hydration < 40) {
      conditions.push('Dehydration')
    } else if (metrics.hydration < 60) {
      conditions.push('Mild Dehydration')
    }

    if (metrics.sunDamage > 60) {
      conditions.push('Sun Damage')
    } else if (metrics.sunDamage > 30) {
      conditions.push('Minor Sun Exposure')
    }

    if (metrics.agingSigns > 70) {
      conditions.push('Wrinkles')
    } else if (metrics.agingSigns > 50) {
      conditions.push('Fine Lines')
    } else if (metrics.agingSigns > 30) {
      conditions.push('Early Fine Lines')
    }

    if (metrics.elasticity < 50) {
      conditions.push('Loss of Firmness')
    }

    if (metrics.pigmentation > 50) {
      conditions.push('Uneven Skin Tone')
    }

    if (metrics.texture < 50) {
      conditions.push('Rough Texture')
    }

    // Check raw AILab data for specific conditions (value >= 1 means detected)
    if (getSeverityValue('acne') >= 1) conditions.push('Acne')
    if (getSeverityValue('dark_circle') >= 1) conditions.push('Dark Circles')
    if (getSeverityValue('eye_pouch') >= 1) conditions.push('Eye Bags')
    if (getSeverityValue('blackhead') >= 1) conditions.push('Blackheads')
    if (getSeverityValue('nasolabial_fold') >= 2) conditions.push('Nasolabial Folds')
    if (getSeverityValue('forehead_wrinkle') >= 1) conditions.push('Forehead Lines')
    if (getSeverityValue('crows_feet') >= 1) conditions.push("Crow's Feet")

    // Check pores
    const maxPore = Math.max(
      getSeverityValue('pores_forehead'),
      getSeverityValue('pores_left_cheek'),
      getSeverityValue('pores_right_cheek'),
      getSeverityValue('pores_jaw')
    )
    if (maxPore >= 1) conditions.push('Enlarged Pores')

    // Return unique conditions, limit to most relevant
    const uniqueConditions = [...new Set(conditions)]
    console.log('📋 Detected conditions:', uniqueConditions)
    return uniqueConditions.slice(0, 6)
  }

  estimateAgeFromSkin(metrics) {
    let baseAge = 25

    if (metrics.agingSigns > 70) baseAge += 25
    else if (metrics.agingSigns > 50) baseAge += 15
    else if (metrics.agingSigns > 30) baseAge += 8

    if (metrics.elasticity < 50) baseAge += 10
    else if (metrics.elasticity < 70) baseAge += 5

    return Math.min(70, Math.max(18, Math.round(baseAge)))
  }

  getMockAnalysis() {
    console.log('📋 [SkinAnalysis] Using mock skin analysis data')
    const skinMetrics = {
      hydration: 65,
      elasticity: 72,
      sunDamage: 35,
      agingSigns: 28,
      texture: 78,
      pigmentation: 25,
    }
    return {
      skinMetrics,
      conditions: ['Mild Dehydration', 'Early Fine Lines', 'Minor Sun Exposure'],
      mainIssues: [
        {
          title: 'Skin Hydration',
          description: 'Skin could benefit from additional hydration for a healthier glow.',
          severity: 'medium',
          area: 'hydration',
        },
      ],
      achievements: [
        {
          title: 'Fix Skin',
          description: 'Your skin is clear with good texture and no active blemishes.',
          icon: 'sparkles',
        },
        {
          title: 'Reduce Aging',
          description: 'Minimal signs of aging with good skin elasticity maintained.',
          icon: 'clock',
        },
      ],
      overallScore: this.calculateOverallScore(skinMetrics),
    }
  }
}

export const aiLabService = new AILabService()
