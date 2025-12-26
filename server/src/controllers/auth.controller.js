import { authService } from '../services/auth.service.js'

const isProduction = process.env.NODE_ENV === 'production'

const cookieOptions = {
  httpOnly: true,
  secure: isProduction, // Must be true for sameSite: 'none'
  sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin in production
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
}

// Options for clearing cookies (without maxAge)
const clearCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
}

export async function registerController(req, res, next) {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        error: 'Email, password, and name are required',
      })
      return
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      })
      return
    }

    const { user, tokens } = await authService.register(email, password, name)

    res.cookie('refreshToken', tokens.refreshToken, cookieOptions)

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken: tokens.accessToken,
        message: 'Please check your email to verify your account',
      },
    })
  } catch (error) {
    if (error.message === 'Email already registered') {
      res.status(409).json({
        success: false,
        error: error.message,
      })
      return
    }
    next(error)
  }
}

export async function loginController(req, res, next) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      })
      return
    }

    const { user, tokens } = await authService.login(email, password)

    res.cookie('refreshToken', tokens.refreshToken, cookieOptions)

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          profile: user.profile,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken: tokens.accessToken,
      },
    })
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      res.status(401).json({
        success: false,
        error: error.message,
      })
      return
    }
    next(error)
  }
}

export async function logoutController(req, res) {
  // Invalidate all refresh tokens for this user
  if (req.userId) {
    await authService.invalidateTokens(req.userId)
  }

  res.clearCookie('refreshToken', clearCookieOptions)
  res.json({
    success: true,
    message: 'Logged out successfully',
  })
}

export async function refreshController(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: 'Refresh token not found',
      })
      return
    }

    const tokens = await authService.refreshTokens(refreshToken)

    res.cookie('refreshToken', tokens.refreshToken, cookieOptions)

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
      },
    })
  } catch (error) {
    res.clearCookie('refreshToken', clearCookieOptions)
    res.status(401).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getMeController(req, res) {
  const user = req.user
  res.json({
    success: true,
    data: {
      id: user._id,
      email: user.email,
      name: user.name,
      profile: user.profile,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    },
  })
}

export async function updateProfileController(req, res, next) {
  try {
    const { name, profile } = req.body
    const user = await authService.updateProfile(req.userId, { name, profile })

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      })
      return
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        profile: user.profile,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function changePasswordController(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Current password and new password are required',
      })
      return
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters',
      })
      return
    }

    await authService.changePassword(req.userId, currentPassword, newPassword)

    res.json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    if (error.message === 'Current password is incorrect') {
      res.status(400).json({
        success: false,
        error: error.message,
      })
      return
    }
    next(error)
  }
}

export async function deleteAccountController(req, res, next) {
  try {
    await authService.deleteAccount(req.userId)
    res.clearCookie('refreshToken', clearCookieOptions)

    res.json({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

export async function verifyEmailController(req, res, next) {
  try {
    const { token } = req.body

    if (!token) {
      res.status(400).json({
        success: false,
        error: 'Verification token is required',
      })
      return
    }

    await authService.verifyEmail(token)

    res.json({
      success: true,
      message: 'Email verified successfully',
    })
  } catch (error) {
    if (error.message === 'Invalid or expired verification token') {
      res.status(400).json({
        success: false,
        error: error.message,
      })
      return
    }
    next(error)
  }
}

export async function resendVerificationController(req, res, next) {
  try {
    const { email } = req.body

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email is required',
      })
      return
    }

    await authService.resendVerificationEmail(email)

    res.json({
      success: true,
      message: 'Verification email sent',
    })
  } catch (error) {
    if (error.message === 'Email already verified') {
      res.status(400).json({
        success: false,
        error: error.message,
      })
      return
    }
    // Don't reveal if user doesn't exist
    res.json({
      success: true,
      message: 'If the email exists, a verification link has been sent',
    })
  }
}

export async function forgotPasswordController(req, res, next) {
  try {
    const { email } = req.body

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email is required',
      })
      return
    }

    await authService.forgotPassword(email)

    // Always return success to not reveal if email exists
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent',
    })
  } catch (error) {
    next(error)
  }
}

export async function resetPasswordController(req, res, next) {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      res.status(400).json({
        success: false,
        error: 'Token and new password are required',
      })
      return
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      })
      return
    }

    await authService.resetPassword(token, password)

    res.json({
      success: true,
      message: 'Password reset successfully',
    })
  } catch (error) {
    if (error.message === 'Invalid or expired reset token') {
      res.status(400).json({
        success: false,
        error: error.message,
      })
      return
    }
    next(error)
  }
}
