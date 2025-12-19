import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getAnalysisResult } from '../services/api'
import { AnalysisResult } from '../types'
import FacialAnalysisCard from '../components/analysis/FacialAnalysisCard'
import PeptideRecommendations from '../components/analysis/PeptideRecommendations'
import { ArrowLeft, Download, Share2 } from 'lucide-react'

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [result, setResult] = useState<AnalysisResult | null>(
    location.state?.result || null
  )
  const [loading, setLoading] = useState(!result)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!result && id) {
      setLoading(true)
      getAnalysisResult(id)
        .then(setResult)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [id, result])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Results Not Found
        </h1>
        <p className="text-gray-600 mb-6">{error || 'Unable to load analysis results.'}</p>
        <button onClick={() => navigate('/analyze')} className="btn-primary">
          Start New Analysis
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate('/analyze')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            New Analysis
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Your Analysis Results
          </h1>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Facial Analysis */}
        <FacialAnalysisCard analysis={result.facialAnalysis} />

        {/* Peptide Recommendations */}
        <PeptideRecommendations recommendations={result.recommendations} />
      </div>

      {/* Detailed Insights */}
      <div className="mt-8 card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          AI Insights
        </h2>
        <p className="text-gray-600 whitespace-pre-wrap">
          {result.aiInsights}
        </p>
      </div>
    </div>
  )
}
