import Anthropic from '@anthropic-ai/sdk'
import { FacialAnalysis, PeptideRecommendation } from '../types/index.js'

class ClaudeService {
  private client: Anthropic | null = null

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey) {
      this.client = new Anthropic({ apiKey })
    }
  }

  async getRecommendations(analysis: FacialAnalysis): Promise<{
    recommendations: PeptideRecommendation[]
    aiInsights: string
  }> {
    if (!this.client) {
      console.warn('Anthropic API key not configured, using mock recommendations')
      return this.getMockRecommendations(analysis)
    }

    const prompt = this.buildPrompt(analysis)

    try {
      const response = await this.client.messages.create({
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

      return this.parseResponse(content.text)
    } catch (error) {
      console.error('Claude API error:', error)
      return this.getMockRecommendations(analysis)
    }
  }

  private buildPrompt(analysis: FacialAnalysis): string {
    return `You are a skincare expert specializing in peptide recommendations. Based on the following facial analysis data, provide personalized peptide recommendations.

FACIAL ANALYSIS DATA:
- Estimated Age: ${analysis.estimatedAge}
- Gender: ${analysis.gender}
- Skin Metrics:
  - Hydration Level: ${analysis.skinMetrics.hydration}/100
  - Skin Elasticity: ${analysis.skinMetrics.elasticity}/100
  - Sun Damage: ${analysis.skinMetrics.sunDamage}/100
  - Aging Signs: ${analysis.skinMetrics.agingSigns}/100
  - Texture Quality: ${analysis.skinMetrics.texture}/100
  - Pigmentation Issues: ${analysis.skinMetrics.pigmentation}/100
- Detected Conditions: ${analysis.conditions.join(', ') || 'None'}

Please provide your response in the following JSON format:
{
  "recommendations": [
    {
      "name": "Peptide Name",
      "description": "Brief description of the peptide",
      "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
      "usage": "How to use this peptide",
      "targetConditions": ["Condition it addresses"],
      "priority": "high|medium|low"
    }
  ],
  "aiInsights": "A detailed paragraph explaining the overall skin assessment and why these peptides were recommended, including any lifestyle or skincare routine suggestions."
}

Provide 3-5 peptide recommendations, prioritized by importance for this person's skin concerns. Focus on well-known peptides like:
- Argireline (Acetyl Hexapeptide-3)
- Matrixyl (Palmitoyl Pentapeptide-4)
- Copper Peptides (GHK-Cu)
- Syn-Ake
- Leuphasyl
- SNAP-8
- Palmitoyl Tripeptide-1
- Palmitoyl Tetrapeptide-7

Respond ONLY with the JSON object, no additional text.`
  }

  private parseResponse(text: string): {
    recommendations: PeptideRecommendation[]
    aiInsights: string
  } {
    try {
      // Extract JSON from the response
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

  private getMockRecommendations(analysis: FacialAnalysis): {
    recommendations: PeptideRecommendation[]
    aiInsights: string
  } {
    const recommendations: PeptideRecommendation[] = []

    // Add recommendations based on conditions
    if (analysis.skinMetrics.agingSigns > 40 || analysis.conditions.includes('Fine Lines')) {
      recommendations.push({
        name: 'Argireline (Acetyl Hexapeptide-3)',
        description: 'Known as "Botox in a bottle", this peptide helps reduce the appearance of expression lines.',
        benefits: [
          'Reduces appearance of fine lines',
          'Relaxes facial muscles',
          'Non-invasive anti-aging solution',
        ],
        usage: 'Apply to clean skin morning and evening, focusing on forehead and eye area.',
        targetConditions: ['Fine Lines', 'Wrinkles'],
        priority: 'high',
      })
    }

    if (analysis.skinMetrics.elasticity < 70 || analysis.conditions.includes('Loss of Firmness')) {
      recommendations.push({
        name: 'Matrixyl (Palmitoyl Pentapeptide-4)',
        description: 'Stimulates collagen production and helps restore skin firmness and elasticity.',
        benefits: [
          'Boosts collagen synthesis',
          'Improves skin firmness',
          'Reduces wrinkle depth',
        ],
        usage: 'Use in serum or moisturizer form twice daily.',
        targetConditions: ['Loss of Firmness', 'Collagen Loss'],
        priority: 'high',
      })
    }

    if (analysis.skinMetrics.hydration < 60 || analysis.conditions.includes('Dehydration')) {
      recommendations.push({
        name: 'Palmitoyl Tripeptide-1',
        description: 'Helps repair skin barrier and improve moisture retention.',
        benefits: [
          'Enhances skin hydration',
          'Strengthens skin barrier',
          'Promotes cell renewal',
        ],
        usage: 'Apply as part of your evening skincare routine.',
        targetConditions: ['Dehydration', 'Rough Texture'],
        priority: 'medium',
      })
    }

    if (analysis.skinMetrics.sunDamage > 40 || analysis.conditions.includes('Uneven Skin Tone')) {
      recommendations.push({
        name: 'Copper Peptides (GHK-Cu)',
        description: 'Powerful antioxidant that helps repair sun damage and improve skin tone.',
        benefits: [
          'Repairs sun-damaged skin',
          'Evens skin tone',
          'Promotes wound healing',
        ],
        usage: 'Use in the evening, can be combined with retinol.',
        targetConditions: ['Sun Damage', 'Uneven Skin Tone'],
        priority: 'medium',
      })
    }

    // Always add a general recommendation
    recommendations.push({
      name: 'Palmitoyl Tetrapeptide-7',
      description: 'Anti-inflammatory peptide that helps maintain youthful skin appearance.',
      benefits: [
        'Reduces inflammation',
        'Protects against environmental damage',
        'Supports overall skin health',
      ],
      usage: 'Can be used morning and evening in combination with other peptides.',
      targetConditions: ['General Aging', 'Inflammation'],
      priority: 'low',
    })

    const aiInsights = `Based on your facial analysis, your skin shows ${
      analysis.skinMetrics.agingSigns > 50 ? 'moderate' : 'mild'
    } signs of aging with ${
      analysis.skinMetrics.hydration < 60 ? 'some dehydration concerns' : 'adequate hydration levels'
    }. ${
      analysis.conditions.length > 0
        ? `The detected conditions (${analysis.conditions.join(', ')}) suggest focusing on ${
            analysis.skinMetrics.elasticity < 70 ? 'firming and collagen-boosting' : 'preventive anti-aging'
          } peptides.`
        : 'Your skin appears to be in generally good condition with room for preventive care.'
    } The recommended peptides above are tailored to address your specific concerns. For best results, introduce one peptide at a time and allow your skin to adjust before adding another. Always use sunscreen during the day, as peptides can increase skin sensitivity.`

    return { recommendations, aiInsights }
  }
}

export const claudeService = new ClaudeService()
