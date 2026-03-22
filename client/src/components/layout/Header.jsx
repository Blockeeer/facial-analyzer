import { Link } from 'react-router-dom'
import { Dna, LogOut, User, History } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAuthModal } from '../../context/AuthModalContext'
import { useState } from 'react'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { openLoginModal, openRegisterModal } = useAuthModal()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = async () => {
    await logout()
    setShowDropdown(false)
  }

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
              <Dna className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">PeptiScan</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/analyze" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
                  Analyze
                </Link>
                <Link to="/history" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
                  History
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name}</span>
                </button>

                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-gray-50 rounded-xl shadow-2xl border border-gray-200 py-2 z-20 backdrop-blur-sm">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                      </div>
                      <Link
                        to="/history"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <History className="w-4 h-4" />
                        Analysis History
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={openLoginModal}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={openRegisterModal}
                  className="px-4 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 shadow-glow hover:shadow-glow-lg transition-all text-sm"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
