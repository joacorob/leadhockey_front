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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <h2 className="text-lg font-extrabold text-gray-800 px-6 py-4 border-b">TRAINING CONTENT</h2>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-700" />

        {items.map((item, index) => (
          <TrainingItem
            key={item.id || index}
            item={item}
            index={index}
            isActive={index === activeIndex}
            expanded={expandedIndex === index}
            onClick={() => {
              setExpandedIndex(expandedIndex === index ? null : index)
              onItemClick(index)
            }}
          />
        ))}
      </div>
    </div>
  )
}

