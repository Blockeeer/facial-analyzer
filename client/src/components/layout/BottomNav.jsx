import { Link, useLocation } from 'react-router-dom'
import { Home, Dna, History } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function BottomNav() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark-900/95 backdrop-blur-md border-t border-dark-700">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">

        <Link
          to="/"
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
            isActive('/') ? 'text-primary-400' : 'text-dark-400 hover:text-dark-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs font-medium">Home</span>
        </Link>

        <Link
          to="/analyze"
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
            isActive('/analyze') ? 'text-primary-400' : 'text-dark-400 hover:text-dark-200'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            isActive('/analyze')
              ? 'bg-gradient-to-br from-primary-600 to-primary-500 shadow-glow'
              : 'bg-dark-700 border border-dark-600'
          }`}>
            <Dna className={`w-5 h-5 ${isActive('/analyze') ? 'text-white' : 'text-dark-300'}`} />
          </div>
          <span className="text-xs font-medium">Analyze</span>
        </Link>

        {isAuthenticated && (
          <Link
            to="/history"
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
              isActive('/history') ? 'text-primary-400' : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-xs font-medium">History</span>
          </Link>
        )}

      </div>
    </nav>
  )
}
