import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import AnalysisPage from './pages/AnalysisPage'
import ResultsPage from './pages/ResultsPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analyze" element={<AnalysisPage />} />
        <Route path="/results/:id" element={<ResultsPage />} />
      </Routes>
    </Layout>
  )
}

export default App
