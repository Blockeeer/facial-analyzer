import Anthropic from '@anthropic-ai/sdk'

class ClaudeService {
  constructor() {
    this.client = null
  }

  getClient() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey && !this.client) {
      this.client = new Anthropic({ apiKey })
      console.log('🔑 Anthropic API key found:', apiKey.substring(0, 15) + '...')
    }
    return this.client
  }

  async getRecommendations(analysis) {
    const client = this.getClient()

    if (!client) {
      console.warn('⚠️  Anthropic API key not configured, using mock recommendations')
      return this.getMockRecommendations(analysis)
    }

    console.log('🔄 Getting peptide recommendations from Claude...')
    const prompt = this.buildPrompt(analysis)

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response format')
      }

      console.log('✅ Claude recommendations received')
      return this.parseResponse(content.text)
    } catch (error) {
      console.error('❌ Claude API error:', error.message || error)
      console.log('📋 Falling back to mock recommendations')
      return this.getMockRecommendations(analysis)
    }
  }

  buildPrompt(analysis) {
    // Get main issues for context
    const mainIssues = analysis.mainIssues?.map(i => i.title).join(', ') || 'None detected'

    return `You are a skincare expert specializing in peptide recommendations. Based on the following skin analysis data, provide personalized peptide recommendations grouped by what they fix.

SKIN ANALYSIS DATA:
- Main Issues Detected: ${mainIssues}
- Skin Metrics:
  - Hydration Level: ${analysis.skinMetrics?.hydration || 0}/100
  - Skin Elasticity: ${analysis.skinMetrics?.elasticity || 0}/100
  - Sun Damage: ${analysis.skinMetrics?.sunDamage || 0}/100
  - Aging Signs: ${analysis.skinMetrics?.agingSigns || 0}/100
  - Texture Quality: ${analysis.skinMetrics?.texture || 0}/100
  - Pigmentation Issues: ${analysis.skinMetrics?.pigmentation || 0}/100
- Detected Conditions: ${analysis.conditions?.join(', ') || 'None'}

Please provide your response in the following JSON format:
{
  "recommendations": [
    {
      "name": "Peptide Name",
      "category": "Category name like 'Fix Skin', 'Reduce Aging', 'Add Bonemass', 'Improve Texture'",
      "targetConditions": ["What condition it addresses"]
    }
  ],
  "aiInsights": "Brief summary of the recommendations."
}

Group peptides by category based on what they fix:
- "Fix Skin" - for skin texture, blemishes, redness
- "Reduce Aging" - for wrinkles, fine lines, loss of elasticity
- "Improve Hydration" - for dry skin, dehydration
- "Even Skin Tone" - for hyperpigmentation, dark circles, uneven tone
- "Add Bonemass" - for jawline definition, facial structure (like CJC-1295/Ipamorelin)

Focus on well-known peptides like:
- GHK-Cu (Copper Peptides)
- BPC-157
- Melanotan 2
- CJC-1295/Ipamorelin
- Argireline
- Matrixyl
- SNAP-8

Provide 3-6 peptide recommendations based on the detected issues.
Respond ONLY with the JSON object, no additional text.`
  }

  parseResponse(text) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      return {
        recommendations: parsed.recommendations || [],
        aiInsights: parsed.aiInsights || '',
      }
    } catch (error) {
      console.error('Failed to parse Claude response:', error)
      throw new Error('Failed to parse AI recommendations')
    }
  }

  getMockRecommendations(analysis) {
    const recommendations = []

    // Check for skin issues
    if (analysis.skinMetrics?.texture < 70 || analysis.conditions?.includes('Rough Texture')) {
      recommendations.push({
        name: 'GHK-Cu',
        category: 'Fix Skin',
        targetConditions: ['Uneven skin tone and texture'],
      })
      recommendations.push({
        name: 'BPC-157',
        category: 'Fix Skin',
        targetConditions: ['Minor blemishes and redness'],
      })
    }

    // Check for pigmentation
    if (analysis.skinMetrics?.pigmentation > 30 || analysis.conditions?.includes('Dark Circles')) {
      recommendations.push({
        name: 'Melanotan 2',
        category: 'Even Skin Tone',
        targetConditions: ['Under-eye hyperpigmentation'],
      })
    }

    // Check for aging signs
    if (analysis.skinMetrics?.agingSigns > 30 || analysis.conditions?.includes('Fine Lines')) {
      recommendations.push({
        name: 'Argireline',
        category: 'Reduce Aging',
        targetConditions: ['Fine lines and wrinkles'],
      })
    }

    // Check for elasticity
    if (analysis.skinMetrics?.elasticity < 70) {
      recommendations.push({
        name: 'CJC-1295/Ipamorelin',
        category: 'Add Bonemass',
        targetConditions: ['Jawline definition'],
      })
    }

    // Check for hydration
    if (analysis.skinMetrics?.hydration < 60) {
      recommendations.push({
        name: 'Palmitoyl Tripeptide-1',
        category: 'Improve Hydration',
        targetConditions: ['Dehydration and moisture retention'],
      })
    }

    // Ensure at least some recommendations
    if (recommendations.length === 0) {
      recommendations.push({
        name: 'GHK-Cu',
        category: 'Fix Skin',
        targetConditions: ['General skin health'],
      })
      recommendations.push({
        name: 'Matrixyl',
        category: 'Reduce Aging',
        targetConditions: ['Preventive anti-aging'],
      })
    }

    const aiInsights = 'These peptide recommendations are based on your skin analysis. Always consult with a dermatologist before starting any new skincare regimen.'

    return { recommendations, aiInsights }
  }
}

export const claudeService = new ClaudeService()
