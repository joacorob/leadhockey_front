import { PracticePlanItem } from "@/lib/types/practice-plan"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TrainingItemProps {
  item: PracticePlanItem
  index: number
  isActive: boolean
  expanded: boolean
  onClick?: () => void
}

export function TrainingItem({ item, index, isActive, expanded, onClick }: TrainingItemProps) {
  const thumbnail = item.thumbnail_url || "/placeholder-logo.png"
  
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "DRILL":
        return "default"
      case "VIDEO_SESSION":
        return "secondary"
      case "FAVOURITE":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md",
        isActive ? "bg-blue-50 border-blue-500 shadow-md" : "bg-white border-gray-200"
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white",
            isActive ? "bg-blue-600" : "bg-gray-400"
          )}
        >
          {index + 1}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className={cn(
            "font-medium text-sm truncate",
            isActive ? "text-blue-900" : "text-gray-900"
          )}>
            {item.title || `Item ${item.itemId}`}
          </h3>
          <Badge variant={getBadgeVariant(item.itemType)} className="text-xs flex-shrink-0">
            {item.itemType === "VIDEO_SESSION" ? "Video" : item.itemType === "DRILL" ? "Drill" : "Fav"}
          </Badge>
        </div>
        {expanded && (
          <img
            src={thumbnail}
            alt={item.title || "Item thumbnail"}
            className="w-full h-20 object-cover rounded mb-2"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-logo.png"
            }}
          />
        )}
        
        {item.startTime && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{item.startTime}</span>
          </div>
        )}
      </div>
    </div>
  )
}

