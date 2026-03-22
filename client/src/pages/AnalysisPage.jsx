import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ImageUploader from '../components/analysis/ImageUploader'
import CameraCapture from '../components/analysis/CameraCapture'
import StackChat from '../components/analysis/StackChat'
import AnalysisLoader from '../components/analysis/AnalysisLoader'
import { analyzeImage } from '../services/api'
import { Camera, Upload, Sparkles, Shield, Zap, Dna, MessageCircle } from 'lucide-react'

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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-4 shadow-glow-lg">
            <Dna className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Skin Analysis</h1>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Upload a clear face photo to get your personalized peptide recommendations
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex p-1 bg-gray-100 rounded-2xl border border-gray-200 mb-5">
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm ${
              mode === 'upload'
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/25'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <button
            onClick={() => setMode('camera')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm ${
              mode === 'camera'
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/25'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            Camera
          </button>
          <button
            onClick={() => setMode('stack')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm ${
              mode === 'stack'
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/25'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Get Stack
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center text-sm">
            {error}
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-4 mb-5">
          {mode === 'upload' ? (
            <ImageUploader onImageSelect={handleImageCapture} />
          ) : mode === 'camera' ? (
            <CameraCapture onCapture={handleImageCapture} />
          ) : (
            <StackChat />
          )}
        </div>

        {/* Feature pills */}
        <div className="flex justify-center gap-3 flex-wrap mb-5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-full border border-gray-200 text-xs text-gray-600">
            <Zap className="w-3.5 h-3.5 text-primary-400" />
            Fast Results
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-full border border-gray-200 text-xs text-gray-600">
            <Shield className="w-3.5 h-3.5 text-accent-400" />
            Private & Secure
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-full border border-gray-200 text-xs text-gray-600">
            <Sparkles className="w-3.5 h-3.5 text-secondary-400" />
            AI-Powered
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
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
                <p className="text-xs text-gray-500 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
