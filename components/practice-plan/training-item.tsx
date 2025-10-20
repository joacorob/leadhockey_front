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
  
  return (
    <>
      <div
        className={cn(
          "flex items-center p-4 cursor-pointer transition",
          isActive ? "bg-gray-100" : "hover:bg-gray-50"
        )}
        onClick={onClick}
      >
        {/* Number badge */}
        <div className="relative mr-4">
          <div className={cn("w-9 h-9 rounded-full flex items-center justify-center font-semibold text-white", isActive ? "bg-blue-700" : "bg-blue-600")}>{index + 1}</div>
        </div>
        {/* Title */}
        <span className={cn("flex-1 text-base font-medium", isActive ? "text-blue-900" : "text-gray-800")}>{item.title || `Item ${item.itemId}`}</span>
        {/* Chevron icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={cn("w-5 h-5 text-gray-400 transform transition-transform", expanded ? "rotate-180" : "")}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {expanded && (
        <div className="pl-20 pr-6 pb-5 flex items-center gap-4">
          {/* Thumbnail */}
          <div className="w-28 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden flex items-center justify-center shadow-sm">
            <img
              src={item.thumbnail_url || "/placeholder.svg"}
              alt={item.title || "Thumbnail"}
              className="object-cover w-full h-full"
              onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.svg")}
            />
          </div>

          {/* Meta info */}
          <div className="text-sm text-gray-700 space-y-1 truncate">
            {(item as any).duration && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{(item as any).duration} min</span>
              </div>
            )}
            {item.startTime && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
                <span>{item.startTime}</span>
              </div>
            )}
            <div className="uppercase text-[10px] tracking-wide text-gray-400">
              {item.itemType === "VIDEO_SESSION" ? "VIDEO" : item.itemType}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

