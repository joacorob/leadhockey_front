"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, Share2, Flag, ThumbsUp, Eye, Calendar, Tag } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface VideoInfoProps {
  video: {
    id: string
    title: string
    description: string
    views: number
    likes: number
    uploadDate: string
    category: string
    tags: string[]
    owner: {
      name: string
      avatar: string
      bio: string
      credentials: string
    }
  }
}

export function VideoInfo({ video }: VideoInfoProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleFavorite = () => {
    setIsFavorited(!isFavorited)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    // You could show a toast notification here
  }

  const handleReport = () => {
    console.log("Report video:", video.id)
    // Handle report functionality
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      {/* Video Title */}
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{video.title}</h1>

      {/* Video Stats and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{video.views.toLocaleString()} views</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Tag className="w-4 h-4" />
            <span>{video.category}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={handleLike}
            variant={isLiked ? "default" : "outline"}
            size="sm"
            className="flex items-center space-x-1"
          >
            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{video.likes + (isLiked ? 1 : 0)}</span>
          </Button>

          <Button
            onClick={handleFavorite}
            variant={isFavorited ? "default" : "outline"}
            size="sm"
            className="flex items-center space-x-1"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
          </Button>

          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </Button>

          <Button
            onClick={handleReport}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1 text-red-600 hover:text-red-700"
          >
            <Flag className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {video.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Description */}
      <div className="mb-6">
        <div className={`text-gray-700 ${showFullDescription ? '' : 'line-clamp-3'}`}>
          {video.description}
        </div>
        {video.description.length > 200 && (
          <Button
            onClick={() => setShowFullDescription(!showFullDescription)}
            variant="ghost"
            size="sm"
            className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-700"
          >
            {showFullDescription ? 'Show less' : 'Show more'}
          </Button>
        )}
      </div>

      {/* Owner Info */}
      <div className="border-t pt-6">
        <div className="flex items-start space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={video.owner.avatar || "/placeholder.svg"} alt={video.owner.name} />
            <AvatarFallback>{video.owner.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{video.owner.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{video.owner.credentials}</p>
            <p className="text-sm text-gray-700">{video.owner.bio}</p>
          </div>

          <Button variant="outline" size="sm">
            Follow
          </Button>
        </div>
      </div>
    </div>
  )
}
