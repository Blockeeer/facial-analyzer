import { useRef, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import { Camera, RotateCcw, Check } from 'lucide-react'

interface CameraCaptureProps {
  onCapture: (imageData: string) => void
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')

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

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-full max-w-md aspect-square rounded-xl overflow-hidden bg-gray-900">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        ) : (
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full h-full object-cover"
            mirrored={facingMode === 'user'}
          />
        )}

        {/* Face Guide Overlay */}
        {!capturedImage && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-80 border-2 border-white/50 rounded-full"></div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        {capturedImage ? (
          <>
            <button
              onClick={retake}
              className="btn-secondary flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Retake
            </button>
            <button
              onClick={confirm}
              className="btn-primary flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              Use This Photo
            </button>
          </>
        ) : (
          <>
            <button
              onClick={toggleCamera}
              className="btn-secondary flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Flip Camera
            </button>
            <button
              onClick={capture}
              className="btn-primary flex items-center gap-2"
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
