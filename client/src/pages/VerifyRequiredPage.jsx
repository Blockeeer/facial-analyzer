import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, CheckCircle, AlertCircle, RefreshCw, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/auth.api'

export default function VerifyRequiredPage() {
  const { user, logout, refreshAuth } = useAuth()
  const navigate = useNavigate()
  const [isResending, setIsResending] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleResend = async () => {
    if (!user?.email) return

    setIsResending(true)
    setMessage('')
    setError('')

    try {
      const response = await authApi.resendVerification(user.email)
      if (response.success) {
        setMessage('Verification email sent! Check your inbox.')
      } else {
        setError(response.error || 'Failed to send email')
      }
    } catch {
      setError('Failed to send verification email')
    } finally {
      setIsResending(false)
    }
  }

  const handleCheckVerification = async () => {
    setIsChecking(true)
    setMessage('')
    setError('')

    try {
      await refreshAuth()
      // Small delay to allow state to update
      setTimeout(() => {
        setIsChecking(false)
        // If still on this page after refresh, show message
        setMessage('Email not verified yet. Please check your inbox.')
      }, 1000)
    } catch {
      setError('Failed to check verification status')
      setIsChecking(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-dark-800/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-dark-700 p-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-6 shadow-glow-lg">
            <Mail className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-3">
            Verify Your Email
          </h1>

          {/* Description */}
          <p className="text-dark-300 mb-2">
            We've sent a verification link to:
          </p>
          <p className="text-primary-400 font-medium mb-6">
            {user?.email || 'your email address'}
          </p>

          <p className="text-dark-400 text-sm mb-8">
            Please check your inbox and click the verification link to access all features.
            Don't forget to check your spam folder.
          </p>

          {/* Success Message */}
          {message && (
            <div className="mb-6 p-4 bg-accent-900/30 border border-accent-700/50 rounded-xl flex items-center gap-3 text-accent-400">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{message}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleCheckVerification}
              disabled={isChecking}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  I've Verified My Email
                </>
              )}
            </button>

            <button
              onClick={handleResend}
              disabled={isResending}
              className="w-full py-3 bg-dark-700/50 hover:bg-dark-700 text-white font-medium rounded-xl border border-dark-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isResending ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Resend Verification Email
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-3 text-dark-400 hover:text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
