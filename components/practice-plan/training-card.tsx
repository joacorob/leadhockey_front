import Link from "next/link"
import { User, Clock } from "lucide-react"

interface PracticePlan {
  id: number
  title: string
  description?: string | null
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
}

export function TrainingCard({ plan }: TrainingCardProps) {
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

  // Get thumbnail from first item with thumbnail (support both "thumbnail" and "thumbnailUrl" fields)
  const getThumbnail = () => {
    const firstItemWithThumb = plan.items.find(item => {
      const el = item.element as any
      return el?.thumbnail || el?.thumbnailUrl
    })
    
    if (firstItemWithThumb?.element) {
      const el = firstItemWithThumb.element as any
      return el.thumbnail || el.thumbnailUrl || "/placeholder-logo.png"
    }
    
    return "/placeholder-logo.png"
  }
  
  const thumbnail = getThumbnail()

  return (
    <Link href={`/train/${plan.id}`}>
      <div className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-blue-900">
          <img
            src={thumbnail}
            alt={plan.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-logo.png"
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
      </div>
    </Link>
  )
}

