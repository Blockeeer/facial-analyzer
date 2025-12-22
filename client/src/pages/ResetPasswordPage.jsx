import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Lock, CheckCircle, AlertCircle, KeyRound } from 'lucide-react'
import { authApi } from '../services/auth.api'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [token])

  const passwordRequirements = [
    { met: password.length >= 6, text: 'At least 6 characters' },
    { met: password === confirmPassword && password.length > 0, text: 'Passwords match' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const response = await authApi.resetPassword(token, password)
      if (response.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/')
        }, 3000)
      } else {
        setError(response.error || 'Failed to reset password')
      }
    } catch {
      setError('Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 p-4">
        <div className="w-full max-w-md bg-dark-800/50 backdrop-blur-sm rounded-3xl border border-dark-700 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Password Reset Successful</h1>
          <p className="text-dark-400 mb-6">
            Your password has been reset successfully. You will be redirected to the home page shortly.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-glow hover:shadow-glow-lg transition-all"
          >
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 p-4">
      <div className="w-full max-w-md bg-dark-800/50 backdrop-blur-sm rounded-3xl border border-dark-700 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-4 shadow-glow">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Set New Password</h1>
          <p className="text-dark-400 mt-2">Enter your new password below</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {token ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Password Requirements */}
            <div className="space-y-2">
              {passwordRequirements.map((req, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 text-sm ${
                    req.met ? 'text-accent-400' : 'text-dark-500'
                  }`}
                >
                  <CheckCircle
                    className={`w-4 h-4 ${req.met ? 'text-accent-400' : 'text-dark-600'}`}
                  />
                  {req.text}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || !passwordRequirements.every((r) => r.met)}
              className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Resetting...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-glow hover:shadow-glow-lg transition-all"
            >
              Go to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
