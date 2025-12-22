import { useState, useEffect } from 'react'
import { X, LogIn, UserPlus, Mail, Lock, User, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode) // 'login', 'register'

  // Sync mode with initialMode when it changes (e.g., when opening login vs register)
  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { login, register } = useAuth()

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setName('')
    setError('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    resetForm()
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const passwordRequirements = [
    { met: password.length >= 6, text: 'At least 6 characters' },
    { met: password === confirmPassword && password.length > 0, text: 'Passwords match' },
  ]

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login({ email, password })
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      await register({ email, password, name })
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md max-h-[95vh] overflow-y-auto bg-dark-800 rounded-2xl sm:rounded-3xl border border-dark-700 shadow-2xl animate-fadeIn">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-5 sm:px-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-3 sm:mb-4 shadow-glow">
            {mode === 'login' && <LogIn className="w-6 h-6 sm:w-8 sm:h-8 text-white" />}
            {mode === 'register' && <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'register' && 'Create Account'}
          </h2>
          <p className="text-dark-400 mt-1 sm:mt-2 text-sm sm:text-base">
            {mode === 'login' && 'Sign in to access your facial analysis'}
            {mode === 'register' && 'Get personalized peptide recommendations'}
          </p>
        </div>

        {/* Content */}
        <div className="px-5 sm:px-8 pb-6 sm:pb-8">
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-900/30 border border-red-700/50 rounded-xl flex items-center gap-2 sm:gap-3 text-red-400">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <p className="text-xs sm:text-sm">{error}</p>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-dark-300 mb-1.5 sm:mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-dark-500" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm sm:text-base"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-dark-300 mb-1.5 sm:mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-dark-500" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm sm:text-base"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 sm:py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="register-name" className="block text-sm font-medium text-dark-300 mb-1 sm:mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-dark-500" />
                  <input
                    id="register-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm sm:text-base"
                    placeholder="John Doe"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-dark-300 mb-1 sm:mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-dark-500" />
                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm sm:text-base"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-dark-300 mb-1 sm:mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-dark-500" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm sm:text-base"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="register-confirm" className="block text-sm font-medium text-dark-300 mb-1 sm:mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-dark-500" />
                  <input
                    id="register-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-dark-700/50 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm sm:text-base"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="flex gap-4 sm:flex-col sm:gap-2">
                {passwordRequirements.map((req, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
                      req.met ? 'text-accent-400' : 'text-dark-500'
                    }`}
                  >
                    <CheckCircle
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                        req.met ? 'text-accent-400' : 'text-dark-600'
                      }`}
                    />
                    {req.text}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading || !passwordRequirements.every((r) => r.met)}
                className="w-full py-2.5 sm:py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-sm sm:text-base"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {/* Toggle mode */}
          <p className="mt-4 sm:mt-6 text-center text-dark-400 text-sm sm:text-base">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => switchMode('register')}
                  className="text-primary-400 hover:text-primary-300 font-medium"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-primary-400 hover:text-primary-300 font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
