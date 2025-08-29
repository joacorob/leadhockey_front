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
  url: string // direct download URL for the document
}

interface VideoDocumentsProps {
  documents: Document[]
}

export function VideoDocuments({ documents }: VideoDocumentsProps) {
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set())
  const [downloadedFiles, setDownloadedFiles] = useState<Set<string>>(new Set())
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({})

  /**
   * Performs an actual file download using the Fetch API and provides basic progress feedback.
   */
  const downloadFile = async (doc: Document) => {
    if (downloadedFiles.has(doc.id) || downloadingFiles.has(doc.id)) return

    setDownloadingFiles(prev => new Set([...prev, doc.id]))
    setDownloadProgress(prev => ({ ...prev, [doc.id]: 0 }))

    try {
      const proxyUrl = `/api/file-proxy?url=${encodeURIComponent(doc.url)}&name=${encodeURIComponent(doc.name)}`
      const response = await fetch(proxyUrl)
      if (!response.ok) throw new Error(`Failed to download ${doc.name}`)

      // Attempt to track progress if browser supports it
      if (response.body && response.headers.get("Content-Length")) {
        const total = Number(response.headers.get("Content-Length"))
        const reader = response.body.getReader()
        let received = 0
        const chunks: Uint8Array[] = []

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          if (value) {
            chunks.push(value)
            received += value.length
            const progress = Math.round((received / total) * 100)
            setDownloadProgress(prev => ({ ...prev, [doc.id]: progress }))
          }
        }

        const blob = new Blob(chunks, { type: "application/pdf" })
        const blobUrl = window.URL.createObjectURL(blob)
        triggerFileSave(blobUrl, doc.name)
      } else {
        // Fallback: just create a link to the URL (stream not readable / no length)
        triggerFileSave(doc.url, doc.name)
        setDownloadProgress(prev => ({ ...prev, [doc.id]: 100 }))
      }

      setDownloadedFiles(prev => new Set([...prev, doc.id]))
    } catch (err) {
      console.error(err)
      // You could show an error toast here
    } finally {
      setDownloadingFiles(prev => {
        const s = new Set(prev)
        s.delete(doc.id)
        return s
      })
    }
  }

  const triggerFileSave = (href: string, filename: string) => {
    const link = document.createElement("a")
    link.href = href
    link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleDownload = (document: Document) => {
    console.log("Downloading:", document.name)
    downloadFile(document)
  }

  const handleDownloadAll = () => {
    console.log("Downloading all documents")
    documents.forEach(doc => {
      downloadFile(doc)
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
