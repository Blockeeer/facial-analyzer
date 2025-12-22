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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-6 shadow-glow-lg">
            <Dna className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Skin Analysis
          </h1>
          <p className="text-lg text-dark-300 max-w-md mx-auto">
            Get personalized peptide recommendations powered by advanced AI facial analysis
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-dark-700/50 backdrop-blur-sm rounded-2xl border border-dark-600">
            <button
              onClick={() => setMode('upload')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                mode === 'upload'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/25'
                  : 'text-dark-300 hover:text-white'
              }`}
            >
              <Upload className="w-5 h-5" />
              Upload Photo
            </button>
            <button
              onClick={() => setMode('camera')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                mode === 'camera'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/25'
                  : 'text-dark-300 hover:text-white'
              }`}
            >
              <Camera className="w-5 h-5" />
              Use Camera
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center animate-fadeIn backdrop-blur-sm">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-dark-800/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-dark-700 p-8 mb-8">
          {mode === 'upload' ? (
            <ImageUploader onImageSelect={handleImageCapture} />
          ) : (
            <CameraCapture onCapture={handleImageCapture} />
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center gap-4 p-4 bg-dark-800/30 backdrop-blur-sm rounded-2xl border border-dark-700 hover:border-primary-600/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-600/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Fast Analysis</h3>
              <p className="text-dark-400 text-xs mt-0.5">Results in seconds</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-dark-800/30 backdrop-blur-sm rounded-2xl border border-dark-700 hover:border-accent-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Privacy First</h3>
              <p className="text-dark-400 text-xs mt-0.5">Images processed securely</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-dark-800/30 backdrop-blur-sm rounded-2xl border border-dark-700 hover:border-secondary-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-secondary-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">AI-Powered</h3>
              <p className="text-dark-400 text-xs mt-0.5">Advanced skin detection</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-br from-primary-900/30 to-primary-800/20 backdrop-blur-sm rounded-2xl p-6 border border-primary-700/30">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-400" />
            </span>
            Tips for Best Results
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-400 text-xs font-bold">1</span>
              </div>
              <p className="text-sm text-dark-300">Ensure good, even lighting on your face</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-400 text-xs font-bold">2</span>
              </div>
              <p className="text-sm text-dark-300">Face the camera directly with neutral expression</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-400 text-xs font-bold">3</span>
              </div>
              <p className="text-sm text-dark-300">Remove glasses and pull hair away from face</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-400 text-xs font-bold">4</span>
              </div>
              <p className="text-sm text-dark-300">Use a plain background if possible</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
