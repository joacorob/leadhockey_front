"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, ChevronDown } from "lucide-react"

interface AnimationDownloadDropdownProps {
  animationGifUrl?: string | null
  animationVideoUrl?: string | null
  animationVideoStatus?: "pending" | "success" | "error" | null
  drillTitle?: string
}

export function AnimationDownloadDropdown({
  animationGifUrl,
  animationVideoUrl,
  animationVideoStatus,
  drillTitle = "drill",
}: AnimationDownloadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleDownload = async (url: string, format: "gif" | "mp4") => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `${drillTitle.replace(/\s+/g, "-").toLowerCase()}-animation.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error("Download failed:", error)
    }
    setIsOpen(false)
  }

  if (!animationGifUrl) {
    return null
  }

  return (
    <div className="relative">
      <Button
        variant="default"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Download
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-20 py-1">
            {/* GIF option - always available */}
            <button
              onClick={() => handleDownload(animationGifUrl, "gif")}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download as GIF</span>
            </button>

            {/* MP4 option - conditional */}
            {animationVideoStatus === "success" && animationVideoUrl ? (
              <button
                onClick={() => handleDownload(animationVideoUrl, "mp4")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download as MP4</span>
              </button>
            ) : animationVideoStatus === "pending" ? (
              <button
                disabled
                className="w-full text-left px-4 py-2 text-gray-400 cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                <span>Converting to MP4...</span>
              </button>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}

