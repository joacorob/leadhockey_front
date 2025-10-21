"use client"

import Link from "next/link"
import { User, Clock, MoreVertical, Copy, Trash2, Edit } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface PracticePlan {
  id: number
  title: string
  description?: string | null
  thumbnailUrl?: string | null
  clubId?: number | null
  createdBy: number
  status: string
  createdAt: string
  updatedAt: string
  items: Array<{
    id: number
    practicePlanId: number
    itemType: string
    itemId: number
    position: number
    startTime?: string | null
    element?: {
      thumbnail?: string
      duration?: number
      title?: string
    }
  }>
}

interface TrainingCardProps {
  plan: PracticePlan
  onClone?: (id: number) => void
  onDelete?: (id: number) => void
  onEdit?: (id: number) => void
}

export function TrainingCard({ plan, onClone, onDelete, onEdit }: TrainingCardProps) {
  const router = useRouter()
  
  // Calculate total duration from items
  const totalDuration = plan.items.reduce((acc, item) => {
    const duration = item.element?.duration || 0
    return acc + duration
  }, 0)

  // Format duration in MM:SS or HH:MM format
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours * 60 + minutes}:00`
    }
    return `${minutes.toString().padStart(2, '0')}:00`
  }

  // Get thumbnail: prioritize plan thumbnail, then first item thumbnail
  const getThumbnail = () => {
    // First priority: plan's own thumbnail
    if (plan.thumbnailUrl) {
      return plan.thumbnailUrl
    }

    // Fallback: first item with thumbnail
    const firstItemWithThumb = plan.items.find(item => {
      const el = item.element as any
      return el?.thumbnail || el?.thumbnailUrl
    })
    
    if (firstItemWithThumb?.element) {
      const el = firstItemWithThumb.element as any
      return el.thumbnail || el.thumbnailUrl || "/placeholder.svg"
    }
    
    return "/placeholder.svg"
  }
  
  const thumbnail = getThumbnail()

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onEdit) {
      onEdit(plan.id)
    } else {
      router.push(`/train/${plan.id}/edit`)
    }
  }

  const handleClone = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClone?.(plan.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete?.(plan.id)
  }

  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer relative">
      <Link href={`/train/${plan.id}`}>
        {/* Thumbnail */}
        <div className="relative aspect-video bg-blue-900">
          <img
            src={thumbnail}
            alt={plan.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg"
            }}
          />
          {/* Duration badge */}
          {totalDuration > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-sm px-2 py-1 rounded">
              {formatDuration(totalDuration)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {plan.title}
          </h3>
          
          {/* Creator info */}
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-1" />
            <span>Created by you</span>
          </div>
        </div>
      </Link>

      {/* Actions menu */}
      {(onClone || onDelete || onEdit) && (
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
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
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {onClone && (
                <DropdownMenuItem onClick={handleClone}>
                  <Copy className="mr-2 h-4 w-4" />
                  Clone
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
  )
}

