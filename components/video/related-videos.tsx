"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Play, User, Eye } from 'lucide-react'
import { allVideos } from "@/data/videos"

interface RelatedVideosProps {
  currentVideoId: string
}

export function RelatedVideos({ currentVideoId }: RelatedVideosProps) {
  const router = useRouter()
  
  // Filter out current video and get related videos
  const relatedVideos = allVideos
    .filter(video => video.id !== currentVideoId)
    .slice(0, 8) // Show 8 related videos

  const handleVideoClick = (videoId: string) => {
    router.push(`/video/${videoId}`)
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Related Videos</h2>
      
      <div className="space-y-4">
        {relatedVideos.map((video) => (
          <div
            key={video.id}
            onClick={() => handleVideoClick(video.id)}
            className="group cursor-pointer flex space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Thumbnail */}
            <div className="relative w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={video.thumbnail || "/placeholder.svg?height=80&width=128"}
                alt={video.title}
                fill
                className="object-cover"
              />
              
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-gray-800 ml-0.5" />
                </div>
              </div>

              {/* Duration */}
              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                {video.duration}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                {video.title}
              </h3>
              
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <User className="w-3 h-3 mr-1" />
                <span className="truncate">{video.coach}</span>
              </div>
              
              <div className="flex items-center text-xs text-gray-500">
                <Eye className="w-3 h-3 mr-1" />
                <span>1.2K views</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/explore')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View all videos →
        </button>
      </div>
    </div>
  )
}
