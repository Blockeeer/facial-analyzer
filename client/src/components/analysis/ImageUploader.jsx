import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image, X, Sparkles } from 'lucide-react'

export default function ImageUploader({ onImageSelect }) {
  const [preview, setPreview] = useState(null)

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        const reader = new FileReader()
        reader.onload = () => {
          setPreview(reader.result)
        }
        reader.readAsDataURL(file)
      }
    },
    []
  )

  const handleConfirm = () => {
    if (preview) {
      // Convert base64 to file for upload
      fetch(preview)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'image.jpg', { type: 'image/jpeg' })
          onImageSelect(file)
        })
    }
  }

  const handleClear = () => {
    setPreview(null)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: !!preview,
  })

  if (preview) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-72 h-72 rounded-2xl overflow-hidden bg-dark-700 shadow-2xl ring-4 ring-dark-600">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/50 to-transparent"></div>
          </div>
          <button
            onClick={handleClear}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClear}
            className="px-6 py-3 rounded-xl font-medium text-dark-300 bg-dark-700 hover:bg-dark-600 border border-dark-600 transition-colors"
          >
            Choose Different
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 shadow-glow hover:shadow-glow-lg transition-all"
          >
            <Sparkles className="w-5 h-5" />
            Analyze Photo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
        isDragActive
          ? 'border-primary-500 bg-primary-900/20 scale-[1.02]'
          : 'border-dark-600 hover:border-primary-500/50 hover:bg-dark-700/30'
      }`}
    >
      <input {...getInputProps()} />

      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary-500/50 rounded-tl-lg"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary-500/50 rounded-tr-lg"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary-500/50 rounded-bl-lg"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary-500/50 rounded-br-lg"></div>

      <div className="flex flex-col items-center gap-4">
        {isDragActive ? (
          <>
            <div className="w-20 h-20 rounded-2xl bg-primary-900/50 flex items-center justify-center animate-bounce border border-primary-700/50">
              <Image className="w-10 h-10 text-primary-400" />
            </div>
            <p className="text-xl font-semibold text-primary-400">
              Drop your image here
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center border border-dark-600">
              <Upload className="w-10 h-10 text-dark-400" />
            </div>
            <div>
              <p className="text-xl font-semibold text-white mb-1">
                Drag & drop your photo here
              </p>
              <p className="text-dark-400">
                or <span className="text-primary-400 font-medium">click to browse</span> from your device
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-dark-400 px-3 py-1.5 bg-dark-700/50 rounded-full border border-dark-600">JPG</span>
              <span className="text-xs text-dark-400 px-3 py-1.5 bg-dark-700/50 rounded-full border border-dark-600">PNG</span>
              <span className="text-xs text-dark-400 px-3 py-1.5 bg-dark-700/50 rounded-full border border-dark-600">WebP</span>
              <span className="text-xs text-dark-400 px-3 py-1.5 bg-dark-700/50 rounded-full border border-dark-600">Max 10MB</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
