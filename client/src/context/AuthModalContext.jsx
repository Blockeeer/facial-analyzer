import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthModal from '../components/auth/AuthModal'
import { useAuth } from './AuthContext'

const AuthModalContext = createContext(null)

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState('login')
  const [redirectOnClose, setRedirectOnClose] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const openLoginModal = useCallback((shouldRedirectOnClose = false) => {
    setMode('login')
    setRedirectOnClose(shouldRedirectOnClose)
    setIsOpen(true)
  }, [])

  const openRegisterModal = useCallback((shouldRedirectOnClose = false) => {
    setMode('register')
    setRedirectOnClose(shouldRedirectOnClose)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    // If user closes modal without authenticating and was on a protected route, redirect to home
    if (redirectOnClose && !isAuthenticated) {
      navigate('/', { replace: true })
    }
    setRedirectOnClose(false)
  }, [redirectOnClose, isAuthenticated, navigate])

  return (
    <AuthModalContext.Provider value={{ openLoginModal, openRegisterModal, closeModal }}>
      {children}
      <AuthModal
        isOpen={isOpen}
        onClose={closeModal}
        initialMode={mode}
      />
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const context = useContext(AuthModalContext)
  if (!context) {
    throw new Error('useAuthModal must be used within AuthModalProvider')
  }
  return context
}
