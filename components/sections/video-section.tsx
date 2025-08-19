"use client"

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { VideoCard } from "@/components/ui/video-card"
import { Video } from "@/data/videos"
import { useRef } from "react"
import { useRouter } from "next/navigation"

interface VideoSectionProps {
  title: string
  videos: Video[]
  onVideoClick?: (video: Video) => void
}

export function VideoSection({ title, videos, onVideoClick }: VideoSectionProps) {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320 // Width of one video card + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
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
            <VideoCard 
              video={video} 
              onClick={() => {
                onVideoClick?.(video)
                router.push(`/video/${video.id}`)
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
