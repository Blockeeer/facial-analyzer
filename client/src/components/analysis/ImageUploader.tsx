import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image } from 'lucide-react'

interface ImageUploaderProps {
  onImageSelect: (file: File) => void
}

export default function ImageUploader({ onImageSelect }: ImageUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onImageSelect(acceptedFiles[0])
      }
    },
    [onImageSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
        isDragActive
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        {isDragActive ? (
          <>
            <Image className="w-16 h-16 text-primary-500" />
            <p className="text-lg font-medium text-primary-600">
              Drop your image here
            </p>
          </>
        ) : (
          <>
            <Upload className="w-16 h-16 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drag & drop your photo here
              </p>
              <p className="text-gray-500 mt-1">
                or click to browse from your device
              </p>
            </div>
            <p className="text-sm text-gray-400">
              Supports JPG, PNG, WebP (max 10MB)
            </p>
          </>
        )}
      </div>
    </div>
  )
}
