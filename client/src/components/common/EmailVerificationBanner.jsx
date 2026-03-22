import { useState } from 'react'
import { Mail, AlertTriangle, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../services/auth.api'

export default function EmailVerificationBanner() {
  const { user, isEmailVerified } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState('')

  // Email verification disabled
  if (!user || isEmailVerified || true) {
    return null
  }

  const handleResend = async () => {
    setIsResending(true)
    setMessage('')

    try {
      const response = await authApi.resendVerification(user.email)
      if (response.success) {
        setMessage('Verification email sent! Check your inbox.')
      } else {
        setMessage(response.error || 'Failed to send email')
      }
    } catch {
      setMessage('Failed to send verification email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-amber-700">Email Verification Required</h3>
          <p className="text-sm text-amber-600 mt-1">
            Please verify your email address to use the AI-powered skin analysis feature.
            Check your inbox for the verification link.
          </p>
          {message && (
            <p className={`text-sm mt-2 flex items-center gap-2 ${
              message.includes('sent') ? 'text-green-600' : 'text-red-600'
            }`}>
              {message.includes('sent') && <CheckCircle className="w-4 h-4" />}
              {message}
            </p>
          )}
          <button
            onClick={handleResend}
            disabled={isResending}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm font-medium rounded-lg border border-amber-200 transition-colors disabled:opacity-50"
          >
            {isResending ? (
              <>
                <span className="w-4 h-4 border-2 border-amber-700/30 border-t-amber-700 rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Resend Verification Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
