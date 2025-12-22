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

// Rate limiting for auth routes (login/register - stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  message: { success: false, error: 'Too many attempts, please try again later' },
})

// Rate limiting for password reset (more lenient)
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: { success: false, error: 'Too many password reset attempts, please try again later' },
})

// Rate limiting for email verification (more lenient)
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  message: { success: false, error: 'Too many attempts, please try again later' },
})

// Public routes
router.post('/register', authLimiter, registerController)
router.post('/login', authLimiter, loginController)
router.post('/refresh', refreshController)
router.post('/verify-email', verifyEmailController)
router.post('/resend-verification', emailLimiter, resendVerificationController)
router.post('/forgot-password', passwordResetLimiter, forgotPasswordController)
router.post('/reset-password', passwordResetLimiter, resetPasswordController)

// Protected routes
router.post('/logout', authMiddleware, logoutController)
router.get('/me', authMiddleware, getMeController)
router.put('/profile', authMiddleware, updateProfileController)
router.put('/password', authMiddleware, changePasswordController)
router.delete('/account', authMiddleware, deleteAccountController)

export default router
