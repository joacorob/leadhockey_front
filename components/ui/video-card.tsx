"use client"

import Image from "next/image"
import { Play, User, Clock } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { formatTimeRemaining } from "@/lib/types/continue-watching"
import { WatchContent, ContentType } from "@/lib/types/watch"

interface VideoCardProps {
  video: WatchContent & {
    progressPercent?: number
    positionSec?: number
    durationSec?: number
    isEliminating?: boolean
  }
  onClick?: () => void
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    
    // Navegar según el tipo de contenido
    if (video.contentType === "DRILL") {
      router.push(`/drills/${video.id}`)
    } else if (video.contentType === "PRACTICE_SESSION") {
      router.push(`/train/${video.id}`)
    } else {
      router.push(`/video/${video.id}`)
    }
  }

  const hasProgress = typeof video.progressPercent === "number"
  const timeRemaining = hasProgress && video.positionSec && video.durationSec
    ? video.durationSec - video.positionSec
    : 0

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

        {/* Tags */}
        {video.isEliminating && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs">
              Eliminating
            </Badge>
          </div>
        )}
        
        {/* Progress bar */}
        {hasProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300/50">
            <div 
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${video.progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{video.title}</h3>
        
        {hasProgress ? (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              {formatTimeRemaining(timeRemaining)}
            </div>
            <span className="text-blue-600 font-medium">
              {Math.floor(video.progressPercent || 0)}%
            </span>
          </div>
        ) : (
          <div className="flex items-center text-xs text-gray-500">
            <User className="w-3 h-3 mr-1" />
            {video.coach}
          </div>
        )}
      </div>
    </div>
  )
}
