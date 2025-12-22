import { Link } from 'react-router-dom'
import { Dna, LogOut, User, History, Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAuthModal } from '../../context/AuthModalContext'
import { useState } from 'react'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { openLoginModal, openRegisterModal } = useAuthModal()
  const [showDropdown, setShowDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setShowDropdown(false)
  }

  const handleOpenLogin = () => {
    setMobileMenuOpen(false)
    openLoginModal()
  }

  const handleOpenRegister = () => {
    setMobileMenuOpen(false)
    openRegisterModal()
  }

  return (
    <header className="bg-dark-900/95 backdrop-blur-md border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
              <Dna className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white">
              PeptiScan
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-dark-300 hover:text-primary-400 transition-colors font-medium"
            >
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/analyze"
                  className="text-dark-300 hover:text-primary-400 transition-colors font-medium"
                >
                  Analyze
                </Link>
                <Link
                  to="/history"
                  className="text-dark-300 hover:text-primary-400 transition-colors font-medium"
                >
                  History
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-dark-700/50 transition-colors border border-transparent hover:border-dark-600"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-dark-200">
                    {user?.name}
                  </span>
                </button>

                {showDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-dark-800 rounded-xl shadow-2xl border border-dark-700 py-2 z-20 backdrop-blur-sm">
                      <div className="px-4 py-3 border-b border-dark-700">
                        <p className="text-sm font-medium text-white">
                          {user?.name}
                        </p>
                        <p className="text-xs text-dark-400 mt-0.5">{user?.email}</p>
                      </div>
                      <Link
                        to="/history"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-dark-300 hover:bg-dark-700/50 hover:text-primary-400 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <History className="w-4 h-4" />
                        Analysis History
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 w-full transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={handleOpenLogin}
                  className="text-dark-300 hover:text-white font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={handleOpenRegister}
                  className="px-4 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 shadow-glow hover:shadow-glow-lg transition-all"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-dark-400 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-dark-700">
            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                className="px-4 py-2 text-dark-300 hover:text-primary-400 hover:bg-dark-700/50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/analyze"
                    className="px-4 py-2 text-dark-300 hover:text-primary-400 hover:bg-dark-700/50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Analyze
                  </Link>
                  <Link
                    to="/history"
                    className="px-4 py-2 text-dark-300 hover:text-primary-400 hover:bg-dark-700/50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    History
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={handleOpenLogin}
                    className="px-4 py-2 text-dark-300 hover:text-primary-400 hover:bg-dark-700/50 rounded-lg transition-colors text-left"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleOpenRegister}
                    className="mx-4 py-2 text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg font-medium"
                  >
                    Get Started
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
