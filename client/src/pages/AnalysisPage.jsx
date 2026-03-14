import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ImageUploader from '../components/analysis/ImageUploader'
import CameraCapture from '../components/analysis/CameraCapture'
import AnalysisLoader from '../components/analysis/AnalysisLoader'
import { analyzeImage } from '../services/api'
import { Camera, Upload, Sparkles, Shield, Zap, Dna } from 'lucide-react'

export default function AnalysisPage() {
  const [mode, setMode] = useState('upload')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { accessToken } = useAuth()

  const handleImageCapture = async (imageData) => {
    if (!accessToken) {
      setError('Please log in to analyze images')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await analyzeImage(imageData, accessToken)
      navigate(`/results/${result.id}`, { state: { result } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
      setIsAnalyzing(false)
    }
  }

  if (isAnalyzing) {
    return <AnalysisLoader />
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-4 shadow-glow-lg">
            <Dna className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Skin Analysis</h1>
          <p className="text-sm text-dark-400 max-w-xs mx-auto">
            Upload a clear face photo to get your personalized peptide recommendations
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex p-1 bg-dark-700/50 rounded-2xl border border-dark-600 mb-5">
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm ${
              mode === 'upload'
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/25'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Photo
          </button>
          <button
            onClick={() => setMode('camera')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm ${
              mode === 'camera'
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/25'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            Use Camera
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center text-sm">
            {error}
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl border border-dark-700 p-4 mb-5">
          {mode === 'upload' ? (
            <ImageUploader onImageSelect={handleImageCapture} />
          ) : (
            <CameraCapture onCapture={handleImageCapture} />
          )}
        </div>

        {/* Feature pills */}
        <div className="flex justify-center gap-3 flex-wrap mb-5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800/50 rounded-full border border-dark-700 text-xs text-dark-300">
            <Zap className="w-3.5 h-3.5 text-primary-400" />
            Fast Results
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800/50 rounded-full border border-dark-700 text-xs text-dark-300">
            <Shield className="w-3.5 h-3.5 text-accent-400" />
            Private & Secure
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800/50 rounded-full border border-dark-700 text-xs text-dark-300">
            <Sparkles className="w-3.5 h-3.5 text-secondary-400" />
            AI-Powered
          </div>
        </div>

        {/* Tips */}
        <div className="bg-dark-800/30 rounded-2xl p-4 border border-dark-700/50">
          <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-400" />
            Tips for Best Results
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Good, even lighting on your face',
              'Face camera with neutral expression',
              'Remove glasses, clear hair from face',
              'Use a plain background if possible',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary-600/20 text-primary-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs text-dark-400 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
