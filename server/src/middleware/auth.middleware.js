import { authService } from '../services/auth.service.js'

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
      })
      return
    }

    const token = authHeader.split(' ')[1]
    const payload = authService.verifyAccessToken(token)

    const user = await authService.getUserById(payload.userId)
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
      })
      return
    }

    req.user = user
    req.userId = payload.userId

    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    })
  }
}

export async function optionalAuthMiddleware(req, _res, next) {
  try {
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const payload = authService.verifyAccessToken(token)
      const user = await authService.getUserById(payload.userId)
      if (user) {
        req.user = user
        req.userId = payload.userId
      }
    }
  } catch {
    // Ignore auth errors for optional auth
  }
  next()
}
