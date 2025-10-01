import { PracticePlanItem } from "@/lib/types/practice-plan"
import { TrainingItem } from "./training-item"
import { useState } from "react"

interface TrainingTimelineProps {
  items: PracticePlanItem[]
  activeIndex: number
  onItemClick: (index: number) => void
}

export function TrainingTimeline({ items, activeIndex, onItemClick }: TrainingTimelineProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <p className="text-gray-500 text-center">No training items available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
        Training Content
      </h2>
      <div className="space-y-3 relative">
        {/* Vertical line connecting items */}
        <div className="absolute left-[17px] top-0 bottom-0 w-0.5 bg-gray-200" />
        
        {items.map((item, index) => (
          <div key={item.id || index} className="relative">
            <TrainingItem
              item={item}
              index={index}
              isActive={index === activeIndex}
              expanded={expandedIndex === index}
              onClick={() => {
                setExpandedIndex(expandedIndex === index ? null : index)
                onItemClick(index)
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

