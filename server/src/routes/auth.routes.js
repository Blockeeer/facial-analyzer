import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
  registerController,
  loginController,
  logoutController,
  refreshController,
  getMeController,
  updateProfileController,
  changePasswordController,
  deleteAccountController,
  verifyEmailController,
  resendVerificationController,
  forgotPasswordController,
  resetPasswordController,
} from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: { success: false, error: 'Too many attempts, please try again later' },
})

// Public routes
router.post('/register', authLimiter, registerController)
router.post('/login', authLimiter, loginController)
router.post('/refresh', refreshController)
router.post('/verify-email', verifyEmailController)
router.post('/resend-verification', authLimiter, resendVerificationController)
router.post('/forgot-password', authLimiter, forgotPasswordController)
router.post('/reset-password', authLimiter, resetPasswordController)

// Protected routes
router.post('/logout', authMiddleware, logoutController)
router.get('/me', authMiddleware, getMeController)
router.put('/profile', authMiddleware, updateProfileController)
router.put('/password', authMiddleware, changePasswordController)
router.delete('/account', authMiddleware, deleteAccountController)

export default router
