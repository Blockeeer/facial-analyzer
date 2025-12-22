import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAnalysisResult } from '../services/api'
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Target,
  TrendingUp,
  Pill,
  ChevronRight,
  Droplets,
  Sun,
  Dna,
  Activity,
} from 'lucide-react'

export default function ResultsPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { accessToken } = useAuth()
  const [result, setResult] = useState(location.state?.result || null)
  const [loading, setLoading] = useState(!result)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!result && id && accessToken) {
      setLoading(true)
      getAnalysisResult(id, accessToken)
        .then(setResult)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [id, result, accessToken])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 rounded-full bg-primary-900/50 flex items-center justify-center animate-pulse">
              <Dna className="w-10 h-10 text-primary-400" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-primary-800 animate-spin border-t-primary-400"></div>
          </div>
          <p className="mt-6 text-dark-300">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Results Not Found
          </h1>
          <p className="text-dark-400 mb-8">{error || 'Unable to load analysis results.'}</p>
          <button
            onClick={() => navigate('/analyze')}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-xl shadow-lg shadow-primary-600/25"
          >
            Start New Analysis
          </button>
        </div>
      </div>
    )
  }

  const { facialAnalysis, imageData, recommendations } = result
  const mainIssues = facialAnalysis.mainIssues || []
  const achievements = facialAnalysis.achievements || []

  // Group recommendations by category
  const groupedRecommendations = {}
  recommendations?.forEach((rec) => {
    const category = rec.category || 'General'
    if (!groupedRecommendations[category]) {
      groupedRecommendations[category] = []
    }
    groupedRecommendations[category].push(rec)
  })

  // Get category icon and color - Updated for Medical Trust palette
  const getCategoryStyle = (category) => {
    const styles = {
      'Fix Skin': { icon: Target, bg: 'bg-primary-900/30', text: 'text-primary-400', border: 'border-primary-700/50', gradient: 'from-primary-500 to-primary-600' },
      'Reduce Aging': { icon: TrendingUp, bg: 'bg-secondary-900/30', text: 'text-secondary-400', border: 'border-secondary-700/50', gradient: 'from-secondary-500 to-secondary-600' },
      'Add Bonemass': { icon: Activity, bg: 'bg-orange-900/30', text: 'text-orange-400', border: 'border-orange-700/50', gradient: 'from-orange-500 to-orange-600' },
      'Even Skin Tone': { icon: Sun, bg: 'bg-amber-900/30', text: 'text-amber-400', border: 'border-amber-700/50', gradient: 'from-amber-500 to-amber-600' },
      'Improve Hydration': { icon: Droplets, bg: 'bg-cyan-900/30', text: 'text-cyan-400', border: 'border-cyan-700/50', gradient: 'from-cyan-500 to-cyan-600' },
    }
    return styles[category] || { icon: Pill, bg: 'bg-dark-700/50', text: 'text-dark-300', border: 'border-dark-600', gradient: 'from-dark-500 to-dark-600' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/analyze')}
            className="flex items-center gap-2 text-dark-400 hover:text-primary-400 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">New Analysis</span>
          </button>
          <div className="flex items-center gap-2 text-sm text-dark-400 bg-accent-900/30 px-3 py-1.5 rounded-full border border-accent-700/50">
            <CheckCircle2 className="w-4 h-4 text-accent-400" />
            Analysis Complete
          </div>
        </div>

        {/* Step 1: Your Photo */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold text-sm shadow-glow">
              1
            </div>
            <h2 className="text-xl font-bold text-white">Your Photo</h2>
          </div>
          {imageData && (
            <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-dark-700 shadow-2xl ring-4 ring-dark-700">
              <img
                src={imageData}
                alt="Analyzed face"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/50 to-transparent"></div>
            </div>
          )}
        </div>

        {/* Step 2: Main Issues */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold text-sm shadow-glow">
              2
            </div>
            <h2 className="text-xl font-bold text-white">Main Issues</h2>
          </div>

          {mainIssues.length > 0 ? (
            <div className="space-y-4">
              {mainIssues.map((issue, index) => (
                <div
                  key={index}
                  className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-5 border border-dark-700 hover:border-primary-600/50 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      issue.severity === 'high' ? 'bg-red-900/50' :
                      issue.severity === 'medium' ? 'bg-amber-900/50' : 'bg-primary-900/50'
                    }`}>
                      <Target className={`w-5 h-5 ${
                        issue.severity === 'high' ? 'text-red-400' :
                        issue.severity === 'medium' ? 'text-amber-400' : 'text-primary-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{issue.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          issue.severity === 'high' ? 'bg-red-900/50 text-red-400 border border-red-700/50' :
                          issue.severity === 'medium' ? 'bg-amber-900/50 text-amber-400 border border-amber-700/50' : 'bg-primary-900/50 text-primary-400 border border-primary-700/50'
                        }`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-dark-300 text-sm leading-relaxed">{issue.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-accent-900/30 backdrop-blur-sm rounded-2xl p-6 border border-accent-700/50">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-accent-400" />
                <p className="text-accent-300 font-medium">No major issues detected! Your skin looks great.</p>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: But there's hope */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold text-sm shadow-glow">
              3
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">But there's hope</h2>
              <p className="text-dark-400 text-sm">Here's what you can do about it</p>
            </div>
          </div>

          {/* Two column layout: Photo + Already Achieved */}
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Left: Your photo */}
            <div className="flex-shrink-0">
              <p className="text-dark-500 text-xs font-medium mb-2 uppercase tracking-wide">Your photo</p>
              {imageData && (
                <div className="w-28 h-28 rounded-2xl overflow-hidden bg-dark-700 shadow-xl ring-2 ring-dark-600">
                  <img
                    src={imageData}
                    alt="Your photo"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Right: Already Achieved */}
            <div className="flex-1 bg-gradient-to-br from-accent-900/30 via-accent-900/20 to-primary-900/20 backdrop-blur-sm rounded-2xl p-6 border border-accent-700/30">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent-400" />
                Already Achieved
              </h3>

              {achievements.length > 0 ? (
                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent-900/50 flex items-center justify-center flex-shrink-0 border border-accent-700/50">
                        <CheckCircle2 className="w-4 h-4 text-accent-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">{achievement.title}</h4>
                        <p className="text-dark-400 text-xs mt-0.5 leading-relaxed">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-dark-400 text-sm">Analysis complete.</p>
              )}
            </div>
          </div>
        </div>

        {/* Step 4: Peptide Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold text-sm shadow-glow">
                4
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Recommended Peptides</h2>
                <p className="text-dark-400 text-sm">Personalized for your skin needs</p>
              </div>
            </div>

            <div className="space-y-6">
              {Object.entries(groupedRecommendations).map(([category, recs]) => {
                const style = getCategoryStyle(category)
                const IconComponent = style.icon

                return (
                  <div key={category} className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-dark-700 overflow-hidden hover:border-primary-600/30 transition-all">
                    <div className={`px-5 py-4 ${style.bg} border-b ${style.border}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-lg`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-bold text-white">{category}</h3>
                        <span className="ml-auto text-xs text-dark-400 bg-dark-700/50 px-2.5 py-1 rounded-full border border-dark-600">{recs.length} peptide{recs.length > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="divide-y divide-dark-700/50">
                      {recs.map((rec, index) => (
                        <div key={index} className="px-5 py-4 hover:bg-dark-700/30 transition-colors group">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-white group-hover:text-primary-400 transition-colors">{rec.name}</h4>
                              {rec.targetConditions && rec.targetConditions.length > 0 && (
                                <p className="text-dark-400 text-sm mt-0.5">{rec.targetConditions.join(', ')}</p>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-dark-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Disclaimer */}
            <div className="mt-6 flex items-start gap-3 p-4 bg-amber-900/20 backdrop-blur-sm rounded-xl border border-amber-700/30">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 text-sm font-medium">Disclaimer</p>
                <p className="text-amber-400/70 text-xs mt-1">These are theoretical suggestions only, not medical advice. Consult a healthcare professional before starting any new treatment.</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="text-center pb-8">
          <button
            onClick={() => navigate('/analyze')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-2xl shadow-glow-lg hover:shadow-glow transition-all transform hover:-translate-y-0.5"
          >
            <Dna className="w-5 h-5" />
            Start New Analysis
          </button>
        </div>
      </div>
    </div>
  )
}
