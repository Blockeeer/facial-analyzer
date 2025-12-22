import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, AlertCircle, Mail, Loader2 } from 'lucide-react'
import { authApi } from '../services/auth.api'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying') // 'verifying', 'success', 'error'
  const [error, setError] = useState('')

  const token = searchParams.get('token')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setError('Invalid verification link. Please request a new verification email.')
        return
      }

      try {
        const response = await authApi.verifyEmail(token)
        if (response.success) {
          setStatus('success')
        } else {
          setStatus('error')
          setError(response.error || 'Failed to verify email')
        }
      } catch {
        setStatus('error')
        setError('Failed to verify email. The link may have expired.')
      }
    }

    verifyEmail()
  }, [token])

  if (status === 'verifying') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 p-4">
        <div className="w-full max-w-md bg-dark-800/50 backdrop-blur-sm rounded-3xl border border-dark-700 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-6">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Verifying Email</h1>
          <p className="text-dark-400">Please wait while we verify your email address...</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 p-4">
        <div className="w-full max-w-md bg-dark-800/50 backdrop-blur-sm rounded-3xl border border-dark-700 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Email Verified!</h1>
          <p className="text-dark-400 mb-6">
            Your email has been verified successfully. You can now access all features of Facial Analyzer.
          </p>
          <Link
            to="/analyze"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-glow hover:shadow-glow-lg transition-all"
          >
            Start Analyzing
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 p-4">
      <div className="w-full max-w-md bg-dark-800/50 backdrop-blur-sm rounded-3xl border border-dark-700 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 mb-6">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Verification Failed</h1>
        <p className="text-dark-400 mb-6">{error}</p>
        <div className="space-y-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-glow hover:shadow-glow-lg transition-all"
          >
            <Mail className="w-5 h-5 mr-2" />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
