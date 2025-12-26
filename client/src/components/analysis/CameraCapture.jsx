import { useRef, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import { Camera, RotateCcw, Check, SwitchCamera, Sparkles, AlertCircle } from 'lucide-react'

export default function CameraCapture({ onCapture }) {
  const webcamRef = useRef(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [facingMode, setFacingMode] = useState('user')
  const [isReady, setIsReady] = useState(false)
  const [cameraError, setCameraError] = useState(null)

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setCapturedImage(imageSrc)
    }
  }, [])

  const retake = () => {
    setCapturedImage(null)
  }

  const confirm = () => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }

  const videoConstraints = {
    width: 720,
    height: 720,
    facingMode,
  }

  // Show error state if camera access failed
  if (cameraError) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-dark-800 shadow-2xl ring-4 ring-dark-700 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Camera Access Denied</h3>
          <p className="text-dark-400 mb-6">
            Please allow camera access in your browser settings to take a photo, or use the upload option instead.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 shadow-glow hover:shadow-glow-lg transition-all"
          >
            <Camera className="w-5 h-5" />
            Try Again
          </button>
        </div>
        <p className="text-dark-500 text-sm">
          Tip: Switch to the "Upload Photo" tab to select an image from your device
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-dark-800 shadow-2xl ring-4 ring-dark-700">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover"
              mirrored={facingMode === 'user'}
              onUserMedia={() => setIsReady(true)}
              onUserMediaError={(error) => {
                console.error('Camera error:', error)
                setCameraError(error?.message || 'Camera access denied')
              }}
            />

            {/* Face Guide Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Oval guide */}
              <div className="relative w-56 h-72">
                <div className="absolute inset-0 border-2 border-primary-400/50 rounded-[50%]"></div>
                {/* Corner markers */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary-400/70 rounded-full"></div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary-400/70 rounded-full"></div>
                <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-1 h-8 bg-primary-400/70 rounded-full"></div>
                <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-1 h-8 bg-primary-400/70 rounded-full"></div>
              </div>
            </div>

            {/* Instructions overlay */}
            {isReady && (
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white/90 text-sm bg-dark-900/60 backdrop-blur-sm inline-block px-4 py-2 rounded-full border border-dark-600">
                  Position your face within the oval
                </p>
              </div>
            )}
          </>
        )}

        {/* Captured overlay */}
        {capturedImage && (
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/70 to-transparent flex items-end justify-center pb-6">
            <div className="flex items-center gap-2 text-white bg-accent-600/90 backdrop-blur-sm px-4 py-2 rounded-full border border-accent-500/50">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Photo captured</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {capturedImage ? (
          <>
            <button
              onClick={retake}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-dark-300 bg-dark-700 hover:bg-dark-600 border border-dark-600 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Retake
            </button>
            <button
              onClick={confirm}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 shadow-glow hover:shadow-glow-lg transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Analyze Photo
            </button>
          </>
        ) : (
          <>
            <button
              onClick={toggleCamera}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-dark-300 bg-dark-700 hover:bg-dark-600 border border-dark-600 transition-colors"
            >
              <SwitchCamera className="w-5 h-5" />
              Flip
            </button>
            <button
              onClick={capture}
              disabled={!isReady}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Camera className="w-5 h-5" />
              Capture Photo
            </button>
          </>
        )}
      </div>
    </div>
  )
}
