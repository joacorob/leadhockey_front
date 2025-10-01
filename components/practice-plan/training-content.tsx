import { PracticePlanItem } from "@/lib/types/practice-plan"
import { Play } from "lucide-react"

interface TrainingContentProps {
  item: PracticePlanItem
  planTitle: string
}

export function TrainingContent({ item, planTitle }: TrainingContentProps) {
  const thumbnail = item.thumbnail_url || "/placeholder-logo.png"

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Main canvas/thumbnail area */}
      <div className="relative bg-gradient-to-br from-blue-900 to-blue-700 aspect-video">
        <img
          src={thumbnail}
          alt={item.title || "Training item"}
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-logo.png"
          }}
        />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-green-500 rounded-full p-6 shadow-2xl hover:bg-green-600 transition-colors cursor-pointer">
            <Play className="w-12 h-12 text-white fill-white" />
          </div>
        </div>
      </div>

      {/* Item details section */}
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {item.itemType === "VIDEO_SESSION" ? "Video Session" : item.itemType === "DRILL" ? "Drill" : "Favourite"}
            </span>
            {item.startTime && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-600">
                  <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {item.startTime}
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {item.title || `Training Item ${item.itemId}`}
          </h1>
        </div>

        {/* Additional description removed to avoid duplication */}
      </div>
    </div>
  )
}

