"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react'

interface ImageDropzoneProps {
  onImageSelect: (base64: string) => void
  onRemove: () => void
  currentImage?: string | null
  maxSizeMB?: number
}

export function ImageDropzone({ 
  onImageSelect, 
  onRemove, 
  currentImage, 
  maxSizeMB = 5 
}: ImageDropzoneProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null)
    
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    const maxSizeBytes = maxSizeMB * 1024 * 1024

    // Validate file size
    if (file.size > maxSizeBytes) {
      setError(`Image size must be less than ${maxSizeMB}MB`)
      return
    }

    setIsProcessing(true)

    // Convert to base64
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setPreview(base64)
      onImageSelect(base64)
      setIsProcessing(false)
    }
    reader.onerror = () => {
      setError('Failed to read image file')
      setIsProcessing(false)
    }
    reader.readAsDataURL(file)
  }, [maxSizeMB, onImageSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: false,
    maxSize: maxSizeMB * 1024 * 1024
  })

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    onRemove()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Preview or Dropzone */}
      {preview ? (
        <div className="relative">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img
              src={preview}
              alt="Thumbnail preview"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            className="absolute top-2 right-2"
          >
            <X className="w-4 h-4 mr-1" />
            Remove
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-blue-400 bg-blue-50' 
              : error
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Processing image...</p>
            </div>
          ) : (
            <>
              <Upload className={`w-12 h-12 mx-auto mb-4 ${error ? 'text-red-400' : 'text-gray-400'}`} />
              {isDragActive ? (
                <p className="text-blue-600 font-medium">Drop the image here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 font-medium mb-2">
                    Drag & drop thumbnail here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PNG, JPG, JPEG, GIF, WebP (max {maxSizeMB}MB)
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}

