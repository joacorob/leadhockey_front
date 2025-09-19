"use client"

import { useDrag } from "react-dnd"
import type { ReactNode } from "react"

interface DraggableItemProps {
  type: string
  subType: string
  color?: string
  label?: string
  size?: number
  children: ReactNode
}

export function DraggableItem({ type, subType, color, label, size, children }: DraggableItemProps) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "drill-item",
      item: (() => {
        const data = { type, subType, color, label, size }
        // debug
        console.log("Begin drag item", data)
        return data
      })(),
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    // Re-create spec whenever these props change so the latest
    // presets (color / size / label) travel with the drag item.
    [type, subType, color, label, size],
  )

  return (
    <div ref={drag} className={`${isDragging ? "opacity-50" : "opacity-100"}`}>
      {children}
    </div>
  )
}
