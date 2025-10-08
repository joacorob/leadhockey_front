"use client"

import { ChevronLeft, ChevronRight, Video as VideoIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { VideoCard } from "@/components/ui/video-card"
import { useApi } from "@/lib/hooks/use-api"
import { useRef } from "react"
import { Video } from "@/data/videos"

interface PlaylistResponse {
  success: boolean
  data: {
    id: number
    name: string
    description?: string
    sessions: Array<{
      id: number
      title: string
      thumbnail?: string
      duration?: number
      views?: number
    }>
  }
}

export function LatestVideosSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Fetch latest playlist from backend
  const { data, loading, error } = useApi<PlaylistResponse>("/playlists/latest")

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320 // Width of one video card + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  // Map backend data to Video format
  const videos: Video[] = data?.data?.sessions?.map((session) => ({
    id: String(session.id),
    title: session.title,
    duration: session.duration ? `${Math.floor(session.duration / 60)}:${(session.duration % 60).toString().padStart(2, "0")}` : "0:00",
    thumbnail: session.thumbnail || "/placeholder-logo.png",
    coach: "Lead Hockey", // Placeholder
    category: "Latest",
    tags: [],
    description: "",
  })) || []

  // Loading state
  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">LATEST</h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-80">
              <div className="bg-gray-200 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-300" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4" />
                  <div className="h-3 bg-gray-300 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">LATEST</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          Failed to load latest videos. Please try again later.
        </div>
      </div>
    )
  }

  // Empty state
  if (!videos || videos.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">LATEST</h2>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-8 text-center">
          <VideoIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No videos available
          </h3>
          <p className="text-gray-600 text-sm">
            Check back later for new content
          </p>
        </div>
      </div>
    )
  }

  // Success state with videos
  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">LATEST</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            className="p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            className="p-2"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Video grid */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {videos.map((video) => (
          <div key={video.id} className="flex-shrink-0 w-80">
            <VideoCard video={video} />
          </div>
        ))}
      </div>
    </div>
  )
}

