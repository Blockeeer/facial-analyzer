import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AuthModalProvider } from './context/AuthModalContext'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import HomePage from './pages/HomePage'
import AnalysisPage from './pages/AnalysisPage'
import ResultsPage from './pages/ResultsPage'
import HistoryPage from './pages/HistoryPage'

function App() {
  return (
    <AuthProvider>
      <AuthModalProvider>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />

            {/* Protected routes */}
            <Route
              path="/analyze"
              element={
                <ProtectedRoute>
                  <AnalysisPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results/:id"
              element={
                <ProtectedRoute>
                  <ResultsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
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
