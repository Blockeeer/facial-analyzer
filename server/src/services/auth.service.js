import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { User } from '../models/index.js'
import { emailService } from './email.service.js'

class AuthService {
  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET || 'default-secret-change-in-production'
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change'
    this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || '15m'
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  }

  async register(email, password, name) {
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new Error('Email already registered')
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create new user with verification token
    const user = await User.create({
      email,
      password,
      name,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    })

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, verificationToken, name)
    } catch (error) {
      console.error('Failed to send verification email:', error)
    }

    // Generate tokens
    const tokens = this.generateTokens(user)

    return { user, tokens }
  }

  async login(email, password) {
    // Find user and include password field
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      throw new Error('Invalid email or password')
    }

    // Generate tokens
    const tokens = this.generateTokens(user)

    // Remove password from response
    user.password = undefined

    return { user, tokens }
  }

  generateTokens(user) {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
    }

    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
    })

    // Include tokenVersion in refresh token to allow invalidation
    const refreshPayload = {
      ...payload,
      tokenVersion: user.tokenVersion || 0,
    }

    const refreshToken = jwt.sign(refreshPayload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry,
    })

    return { accessToken, refreshToken }
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.accessTokenSecret)
    } catch {
      throw new Error('Invalid or expired access token')
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshTokenSecret)
    } catch {
      throw new Error('Invalid or expired refresh token')
    }
  }

  async refreshTokens(refreshToken) {
    const payload = this.verifyRefreshToken(refreshToken)

    // Get fresh user data
    const user = await User.findById(payload.userId)
    if (!user) {
      throw new Error('User not found')
    }

    // Check if token version matches (for logout invalidation)
    if (payload.tokenVersion !== (user.tokenVersion || 0)) {
      throw new Error('Token has been invalidated')
    }

    return this.generateTokens(user)
  }

  async getUserById(userId) {
    return User.findById(userId)
  }

  async updateProfile(userId, updates) {
    return User.findByIdAndUpdate(userId, updates, { new: true })
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password')
    if (!user) {
      throw new Error('User not found')
    }

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      throw new Error('Current password is incorrect')
    }

    user.password = newPassword
    await user.save()
  }

  async deleteAccount(userId) {
    await User.findByIdAndDelete(userId)
  }

  async invalidateTokens(userId) {
    // Increment tokenVersion to invalidate all existing refresh tokens
    await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } })
  }

  async verifyEmail(token) {
    console.log(`🔐 Verifying email with token: ${token?.substring(0, 10)}...`)

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    })

    if (!user) {
      console.log('🔐 No user found with this token or token expired')
      throw new Error('Invalid or expired verification token')
    }

    console.log(`🔐 Found user: ${user.email}, updating verification status...`)

    user.isEmailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationExpires = undefined
    await user.save()

    console.log(`✅ Email verified successfully for: ${user.email}`)
    return user
  }

  async resendVerificationEmail(email) {
    const user = await User.findOne({ email })
    if (!user) {
      throw new Error('User not found')
    }

    if (user.isEmailVerified) {
      throw new Error('Email already verified')
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    user.emailVerificationToken = verificationToken
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await user.save()

    await emailService.sendVerificationEmail(email, verificationToken, user.name)
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email })
    if (!user) {
      // Don't reveal if user exists
      console.log(`📧 Forgot password request for non-existent email: ${email}`)
      return
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await user.save()

    console.log(`📧 Sending password reset email to: ${email}`)
    try {
      await emailService.sendPasswordResetEmail(email, resetToken, user.name)
      console.log(`📧 Password reset email sent successfully to: ${email}`)
    } catch (error) {
      console.error(`📧 Failed to send password reset email to ${email}:`, error.message)
      // Don't throw - we still want to return success to not reveal if email exists
    }
  }

  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      throw new Error('Invalid or expired reset token')
    }

    user.password = newPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()
  }
}

export const authService = new AuthService()
