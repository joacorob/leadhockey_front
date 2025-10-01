"use client"

import { ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { VideoCard } from "@/components/ui/video-card"
import { useApi } from "@/lib/hooks/use-api"
import { useRef } from "react"
import { 
  ContinueWatchingResponse, 
  mapContinueWatchingToVideo 
} from "@/lib/types/continue-watching"

export function ContinueWatchingSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Fetch continue watching data from backend
  const { data, loading, error } = useApi<ContinueWatchingResponse>("/me/continue-watching", {
    limit: 10,
  })

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
  const videos = data?.data?.items?.map(mapContinueWatchingToVideo) || []

  // Loading state
  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">CONTINUE WATCHING</h2>
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
          <h2 className="text-xl font-bold text-gray-900">CONTINUE WATCHING</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          Failed to load continue watching videos. Please try again later.
        </div>
      </div>
    )
  }

  // Empty state
  if (!videos || videos.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">CONTINUE WATCHING</h2>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 text-center">
          <PlayCircle className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No videos in progress
          </h3>
          <p className="text-gray-600 text-sm">
            Start watching a video to see it here and continue where you left off
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
        <h2 className="text-xl font-bold text-gray-900">CONTINUE WATCHING</h2>
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

