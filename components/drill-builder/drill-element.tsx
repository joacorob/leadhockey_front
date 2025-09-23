"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { DrillElement } from "@/app/create/drill/page"

interface DrillElementProps {
  element: DrillElement
  isSelected: boolean
  onClick: (e: React.MouseEvent) => void
  onMove: (id: string, x: number, y: number) => void
  onUpdate: (id: string, updates: Partial<DrillElement>) => void
}

export function DrillElementComponent({ element, isSelected, onClick, onMove, onUpdate }: DrillElementProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isEditing, setIsEditing] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - element.x,
      y: e.clientY - element.y,
    })
    onClick(e)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    onMove(element.id, Math.max(0, newX), Math.max(0, newY))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (element.type === "text") {
      setIsEditing(true)
    }
  }

  const handleTextChange = (newText: string) => {
    onUpdate(element.id, { text: newText })
    setIsEditing(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, dragStart])

  const renderElement = () => {
    const scale = element.size || 1
    const sizeStyle = { transform: `scale(${scale})` }

    switch (element.type) {
      case "player":
        return (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
              isSelected ? "ring-2 ring-black" : ""
            }`}
            style={{ backgroundColor: element.color, ...sizeStyle }}
          >
            {element.text || element.label}
          </div>
        )

      case "equipment":
        return (
          <div className={isSelected ? "ring-2 ring-black rounded" : ""} style={sizeStyle}>
            {(element.subType === "cone" || element.subType === "cone-orange") && (
              <div
                className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent"
                style={{ borderBottomColor: element.color || "#f97316" }}
              />
            )}
            {element.subType === "cone-blue" && (
              <div
                className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent"
                style={{ borderBottomColor: element.color || "#3b82f6" }}
              />
            )}
            {element.subType === "line" && (
              <div className="w-12 h-1" style={{ backgroundColor: element.color || "#ffffff" }} />
            )}
            {element.subType === "circle" && (
              <div
                className="w-8 h-8 rounded-full border-2 bg-transparent"
                style={{ borderColor: element.color || "#ffffff" }}
              />
            )}
            {element.subType === "square" && (
              <div className="w-8 h-8 border-2 bg-transparent" style={{ borderColor: element.color || "#ffffff" }} />
            )}
          </div>
        )

      case "movement":
        return (
          <div className={isSelected ? "ring-2 ring-black rounded" : ""} style={sizeStyle}>
            {element.subType === "arrow" && (
              <svg width="32" height="20" viewBox="0 0 32 20" style={{ color: element.color || "#ffffff" }}>
                <path d="M0 10h28m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            )}
            {element.subType === "dotted-line" && (
              <svg width="32" height="4" viewBox="0 0 32 4" style={{ color: element.color || "#ffffff" }}>
                <path d="M0 2h6m2 0h6m2 0h6m2 0h6" stroke="currentColor" strokeWidth="2" strokeDasharray="2,2" />
              </svg>
            )}
            {element.subType === "curved-line" && (
              <svg width="32" height="20" viewBox="0 0 32 20" style={{ color: element.color || "#ffffff" }}>
                <path d="M0 10c8-8 24-8 32 0" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            )}
          </div>
        )

      case "text":
        return isEditing ? (
          <input
            type="text"
            defaultValue={element.text}
            onBlur={(e) => handleTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleTextChange(e.currentTarget.value)
              }
            }}
            className="bg-white text-black px-2 py-1 rounded text-sm border-none outline-none"
            autoFocus
            onFocus={(e) => e.target.select()}
          />
        ) : (
          <div
            className={`bg-white text-black px-2 py-1 rounded text-sm cursor-text ${
              isSelected ? "ring-2 ring-black" : ""
            }`}
          >
            {element.text || "Text"}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move select-none ${isDragging ? "z-50" : "z-10"}`}
      style={{
        left: element.x,
        top: element.y,
        transform: isDragging ? "scale(1.1)" : "scale(1)",
        transition: isDragging ? "none" : "transform 0.1s ease",
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {renderElement()}
    </div>
  )
}
