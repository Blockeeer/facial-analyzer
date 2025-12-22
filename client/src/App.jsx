import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AuthModalProvider } from './context/AuthModalContext'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import HomePage from './pages/HomePage'
import AnalysisPage from './pages/AnalysisPage'
import ResultsPage from './pages/ResultsPage'
import HistoryPage from './pages/HistoryPage'
import VerifyRequiredPage from './pages/VerifyRequiredPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

function App() {
  return (
    <AuthProvider>
      <AuthModalProvider>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Auth routes - requires login but not verification */}
            <Route path="/verify-required" element={<VerifyRequiredPage />} />

            {/* Protected routes - requires login AND email verification */}
            <Route
              path="/analyze"
              element={
                <ProtectedRoute requireVerification>
                  <AnalysisPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results/:id"
              element={
                <ProtectedRoute requireVerification>
                  <ResultsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute requireVerification>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </AuthModalProvider>
    </AuthProvider>
  )
}

export default App
