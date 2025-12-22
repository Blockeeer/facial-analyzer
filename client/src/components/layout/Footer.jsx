import { Dna, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo and tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Dna className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">PeptiScan</span>
            </Link>
            <p className="text-dark-400 text-sm">
              AI-powered skin analysis for personalized peptide recommendations
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link to="/" className="text-dark-400 hover:text-primary-400 transition-colors">
              Home
            </Link>
            <Link to="/analyze" className="text-dark-400 hover:text-primary-400 transition-colors">
              Analyze
            </Link>
            <a href="#" className="text-dark-400 hover:text-primary-400 transition-colors">
              Privacy
            </a>
            <a href="#" className="text-dark-400 hover:text-primary-400 transition-colors">
              Terms
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-dark-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-dark-500 text-sm">
            &copy; {new Date().getFullYear()} PeptiScan. All rights reserved.
          </p>
          <p className="text-dark-500 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-400 fill-red-400" /> for better skincare
          </p>
        </div>
      </div>
    </footer>
  )
}
