import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ImageUploader from '../components/analysis/ImageUploader'
import CameraCapture from '../components/analysis/CameraCapture'
import AnalysisLoader from '../components/analysis/AnalysisLoader'
import { analyzeImage } from '../services/api'
import { Camera, Upload } from 'lucide-react'

type Mode = 'upload' | 'camera'

export default function AnalysisPage() {
  const [mode, setMode] = useState<Mode>('upload')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleImageCapture = async (imageData: string | File) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await analyzeImage(imageData)
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Analyze Your Face
        </h1>
        <p className="text-gray-600">
          Choose how you'd like to provide your photo for analysis
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setMode('upload')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            mode === 'upload'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Upload className="w-5 h-5" />
          Upload Photo
        </button>
        <button
          onClick={() => setMode('camera')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            mode === 'camera'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Camera className="w-5 h-5" />
          Use Camera
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="card">
        {mode === 'upload' ? (
          <ImageUploader onImageSelect={handleImageCapture} />
        ) : (
          <CameraCapture onCapture={handleImageCapture} />
        )}
      </div>

      {/* Tips */}
      <div className="mt-8 p-6 bg-primary-50 rounded-xl">
        <h3 className="font-semibold text-gray-900 mb-3">Tips for Best Results</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Ensure good, even lighting on your face</li>
          <li>• Face the camera directly with a neutral expression</li>
          <li>• Remove glasses and pull hair away from your face</li>
          <li>• Use a plain background if possible</li>
        </ul>
      </div>
    </div>
  )
}
