"use client"

import Image from "next/image"
import { Play, User } from 'lucide-react'
import { ExploreVideo } from "@/data/explore-videos"
import { useRouter } from "next/navigation"

interface ExploreVideoCardProps {
  video: ExploreVideo
  onClick?: () => void
}

export function ExploreVideoCard({ video, onClick }: ExploreVideoCardProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    router.push(`/video/${video.id}`)
  }

  return (
    <div 
      className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100">
        <Image
          src={video.thumbnail || "/placeholder.svg?height=200&width=300"}
          alt={video.title}
          fill
          className="object-cover"
        />
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
            <Play className="w-5 h-5 text-gray-800 ml-1" />
          </div>
        </div>

        {/* Duration */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{video.title}</h3>
        <div className="flex items-center text-xs text-gray-500">
          <User className="w-3 h-3 mr-1" />
          {video.coach}
        </div>
      </div>
    </div>
  )
}
