"use client"

import { useState } from "react"
import { Download, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface Document {
  id: string
  name: string
  type: string
  size: string
  description: string
}

interface VideoDocumentsProps {
  documents: Document[]
}

export function VideoDocuments({ documents }: VideoDocumentsProps) {
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set())
  const [downloadedFiles, setDownloadedFiles] = useState<Set<string>>(new Set())
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({})

  const simulateDownload = async (fileId: string) => {
    setDownloadingFiles(prev => new Set([...prev, fileId]))
    
    // Simulate download progress
    for (let progress = 0; progress <= 100; progress += 10) {
      setDownloadProgress(prev => ({ ...prev, [fileId]: progress }))
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    setDownloadingFiles(prev => {
      const newSet = new Set(prev)
      newSet.delete(fileId)
      return newSet
    })
    
    setDownloadedFiles(prev => new Set([...prev, fileId]))
    setDownloadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileId]
      return newProgress
    })
  }

  const handleDownload = (document: Document) => {
    console.log("Downloading:", document.name)
    simulateDownload(document.id)
  }

  const handleDownloadAll = () => {
    console.log("Downloading all documents")
    documents.forEach(doc => {
      if (!downloadedFiles.has(doc.id) && !downloadingFiles.has(doc.id)) {
        simulateDownload(doc.id)
      }
    })
  }

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />
      default:
        return <FileText className="w-8 h-8 text-gray-500" />
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Training Documents</h2>
        <Button onClick={handleDownloadAll} className="flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Download All</span>
        </Button>
      </div>

      <div className="space-y-4">
        {documents.map((document) => {
          const isDownloading = downloadingFiles.has(document.id)
          const isDownloaded = downloadedFiles.has(document.id)
          const progress = downloadProgress[document.id] || 0

          return (
            <div key={document.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              {/* File Icon */}
              <div className="flex-shrink-0">
                {getFileIcon(document.type)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{document.name}</h3>
                <p className="text-sm text-gray-600 mb-1">{document.description}</p>
                <p className="text-xs text-gray-500">{document.size}</p>
                
                {/* Progress Bar */}
                {isDownloading && (
                  <div className="mt-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">Downloading... {progress}%</p>
                  </div>
                )}
              </div>

              {/* Download Button */}
              <div className="flex-shrink-0">
                {isDownloaded ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Downloaded</span>
                  </div>
                ) : isDownloading ? (
                  <div className="flex items-center space-x-1 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Downloading</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleDownload(document)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Download Summary */}
      {downloadedFiles.size > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-800">
              {downloadedFiles.size} of {documents.length} documents downloaded successfully
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
