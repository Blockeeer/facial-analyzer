import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-semibold text-gray-900">
              Facial Analyzer
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/analyze"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Analyze
            </Link>
          </nav>
          <Link to="/analyze" className="btn-primary">
            Start Analysis
          </Link>
        </div>
      </div>
    </header>
  )
}
