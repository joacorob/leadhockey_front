"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Play, User, Clock, MoreVertical, Trash2, Edit } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { formatTimeRemaining } from "@/lib/types/continue-watching"
import { WatchContent, ContentType } from "@/lib/types/watch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface VideoCardProps {
  video: WatchContent & {
    progressPercent?: number
    positionSec?: number
    durationSec?: number
    isEliminating?: boolean
  }
  onClick?: () => void
  onDelete?: (id: number) => void
  onEdit?: (id: number) => void
  showActions?: boolean
}

export function VideoCard({ video, onClick, onDelete, onEdit, showActions = true }: VideoCardProps) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Reset dropdown state when video changes (e.g., after deletion/refresh)
  useEffect(() => {
    setDropdownOpen(false)
  }, [video.id])

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

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onEdit) {
      onEdit(video.id)
    } else {
      // Default navigation to edit page
      if (video.contentType === "DRILL") {
        router.push(`/drills/${video.id}/edit`)
      } else if (video.contentType === "PRACTICE_SESSION") {
        router.push(`/train/${video.id}/edit`)
      }
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Close dropdown first to avoid overlay conflicts
    setDropdownOpen(false)
    // Small delay to ensure dropdown is closed before opening dialog
    setTimeout(() => {
      onDelete?.(video.id)
    }, 50)
  }

  const hasProgress = typeof video.progressPercent === "number"
  const timeRemaining = hasProgress && video.positionSec && video.durationSec
    ? video.durationSec - video.positionSec
    : 0

  const shouldShowActions =
    showActions && (onDelete || onEdit || video.contentType === "DRILL" || video.contentType === "PRACTICE_SESSION")

  return (
    <div 
      className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100">
        <Image
          src={video.thumbnail || "/placeholder.svg?height=200&width=300"}
          alt={video.title}
          fill
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

        {/* Actions menu */}
        {shouldShowActions && (
          <div className="absolute top-2 right-2 z-10">
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                {(onEdit || video.contentType === "DRILL" || video.contentType === "PRACTICE_SESSION") && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
