import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  CLIENT_URL: z.string().default('http://localhost:5173'),

  // Azure Face API
  AZURE_FACE_ENDPOINT: z.string().optional(),
  AZURE_FACE_KEY: z.string().optional(),

  // Anthropic API
  ANTHROPIC_API_KEY: z.string().optional(),
})

const parseResult = envSchema.safeParse(process.env)

if (!parseResult.success) {
  console.warn('Environment validation warnings:', parseResult.error.format())
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  azure: {
    faceEndpoint: process.env.AZURE_FACE_ENDPOINT || '',
    faceKey: process.env.AZURE_FACE_KEY || '',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  },
}
