// Load environment variables FIRST before any other imports
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import routes from './routes/index.js'
import authRoutes from './routes/auth.routes.js'
import { connectDatabase } from './config/database.js'

const app = express()
const PORT = process.env.PORT || 3001

// Trust proxy for services like Render, Heroku, etc.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}

// Connect to MongoDB
connectDatabase()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

// Cookie parser for refresh tokens
app.use(cookieParser())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later.' },
})
app.use('/api/', limiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api', routes)

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling
app.use((err, _req, res, _next) => {
  console.error('Error:', err.message)

  // Check for known validation errors and return 400 instead of 500
  const validationErrors = [
    'Invalid image. Please upload a clear face photo.',
    'No face detected in the image. Please upload a clear face photo.',
    'Invalid AILab API key',
    'API rate limit exceeded',
    'Analysis timed out',
  ]

  const isValidationError = validationErrors.some(msg => err.message?.includes(msg))
  const statusCode = err.statusCode || (isValidationError ? 400 : 500)

  res.status(statusCode).json({
    success: false,
    error: isValidationError || process.env.NODE_ENV !== 'production'
      ? err.message
      : 'Internal server error',
  })
})

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

// Graceful shutdown to prevent port conflicts
const shutdown = () => {
  console.log('\n🛑 Shutting down server...')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
process.on('SIGHUP', shutdown)
