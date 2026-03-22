import { useAuth } from '../../context/AuthContext'
import { useAuthModal } from '../../context/AuthModalContext'
import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, requireVerification = false }) {
  const { isAuthenticated, isEmailVerified, isLoading } = useAuth()
  const { openLoginModal } = useAuthModal()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Pass true to redirect to home if modal is closed without authenticating
      openLoginModal(true)
    }
  }, [isLoading, isAuthenticated, openLoginModal])

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting (modal will handle it)
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-white via-gray-50 to-white" />
    )
  }

  // If verification is required but user is not verified, redirect to verify page
  if (requireVerification && !isEmailVerified) {
    return <Navigate to="/verify-required" replace />
  }

  return <>{children}</>
}
