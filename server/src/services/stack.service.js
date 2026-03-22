import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load product knowledge base once at startup
let productKnowledge = ''
try {
  productKnowledge = readFileSync(
    join(__dirname, '..', 'data', 'product-catalog.md'),
    'utf-8'
  )
} catch (err) {
  console.warn('⚠️ Could not load PepsLab product guides:', err.message)
}

class StackService {
  constructor() {
    this.client = null
  }

  getClient() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey && !this.client) {
      this.client = new Anthropic({ apiKey })
    }
    return this.client
  }

  async chat(messages) {
    const client = this.getClient()
    if (!client) {
      throw new Error('Anthropic API key not configured')
    }

    const systemPrompt = `You are a peptide stack advisor for PepsLab (pepslab.ca). ONLY recommend products from this catalog:

<catalog>
${productKnowledge}
</catalog>

Standard for all injectables: BAC water reconstitution, subcutaneous injection (abdomen/thigh/arm), 29-31G insulin syringes, store 2-8°C after recon, use within 30 days unless noted.

FLOW: Ask these 5 questions ONE AT A TIME, keep responses short (2-4 sentences):
1. Goals (anti-aging, muscle, fat loss, healing, sleep, hair growth)
2. Body stats (weight, height, age, gender)
3. Timeline (aggressive 4-8wk, moderate 8-12wk, gradual 12-16+wk)
4. Experience with peptides
5. Medical conditions/medications/allergies

After all 5 answers, give a detailed recommendation with:
- Stack overview & why it fits their goals
- For each product: name, mechanism, dosing protocol (from catalog), reconstitution, cycle length, what to expect, side effects
- Full daily/weekly schedule
- Shopping list with quantities from pepslab.ca
- Safety notes

Use exact dosing from the catalog. Use markdown formatting. End with [STACK_COMPLETE]`

    // Convert messages: first message from assistant is handled by system prompt
    const apiMessages = messages
      .filter((m, i) => !(i === 0 && m.role === 'assistant'))
      .map(m => ({
        role: m.role,
        content: m.content,
      }))

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: systemPrompt,
      messages: apiMessages,
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format')
    }

    const text = content.text
    const isComplete = text.includes('[STACK_COMPLETE]')
    const cleanedText = text.replace('[STACK_COMPLETE]', '').trim()

    return {
      message: cleanedText,
      isComplete,
    }
  }
}

export const stackService = new StackService()
