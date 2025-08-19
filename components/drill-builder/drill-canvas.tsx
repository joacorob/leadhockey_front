"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { useDrop } from "react-dnd"
import type { DrillElement } from "@/app/create/drill/page"
import { DrillElementComponent } from "./drill-element"

interface DrillCanvasProps {
  elements: DrillElement[]
  selectedElements: string[]
  onAddElement: (element: Omit<DrillElement, "id">) => void
  onUpdateElement: (id: string, updates: Partial<DrillElement>) => void
  onRemoveElement: (id: string) => void
  onSelectionChange: (selectedIds: string[]) => void
  onMoveSelected: (deltaX: number, deltaY: number) => void
}

export function DrillCanvas({
  elements,
  selectedElements,
  onAddElement,
  onUpdateElement,
  onRemoveElement,
  onSelectionChange,
  onMoveSelected,
}: DrillCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 })
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 })
  const [isDraggingSelected, setIsDraggingSelected] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "drill-item",
    drop: (item: any, monitor) => {
      if (!canvasRef.current) return

      const canvasRect = canvasRef.current.getBoundingClientRect()
      const dropPosition = monitor.getClientOffset()

      if (dropPosition) {
        const x = dropPosition.x - canvasRect.left
        const y = dropPosition.y - canvasRect.top

        onAddElement({
          type: item.type as any,
          subType: item.subType,
          x,
          y,
          color: item.color,
          label: item.label,
          text: item.label === "Text" ? "Sample Text" : item.label === "Note" ? "Note" : undefined,
        })
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (e.ctrlKey || e.metaKey) {
        return
      }

      setIsSelecting(true)
      setSelectionStart({ x, y })
      setSelectionEnd({ x, y })

      if (!e.shiftKey) {
        onSelectionChange([])
      }
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isSelecting || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setSelectionEnd({ x, y })

    const minX = Math.min(selectionStart.x, x)
    const maxX = Math.max(selectionStart.x, x)
    const minY = Math.min(selectionStart.y, y)
    const maxY = Math.max(selectionStart.y, y)

    const elementsInSelection = elements
      .filter((element) => element.x >= minX && element.x <= maxX && element.y >= minY && element.y <= maxY)
      .map((el) => el.id)

    onSelectionChange(elementsInSelection)
  }

  const handleMouseUp = () => {
    setIsSelecting(false)
    setIsDraggingSelected(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Delete" && selectedElements.length > 0) {
      selectedElements.forEach((id) => onRemoveElement(id))
      onSelectionChange([])
    }

    if (e.key === "Escape") {
      onSelectionChange([])
    }

    if (selectedElements.length > 0) {
      let deltaX = 0,
        deltaY = 0
      const step = e.shiftKey ? 10 : 1

      switch (e.key) {
        case "ArrowLeft":
          deltaX = -step
          break
        case "ArrowRight":
          deltaX = step
          break
        case "ArrowUp":
          deltaY = -step
          break
        case "ArrowDown":
          deltaY = step
          break
        default:
          return
      }

      if (deltaX !== 0 || deltaY !== 0) {
        e.preventDefault()
        onMoveSelected(deltaX, deltaY)
      }
    }
  }

  const handleElementClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (e.ctrlKey || e.metaKey) {
      if (selectedElements.includes(id)) {
        onSelectionChange(selectedElements.filter((selectedId) => selectedId !== id))
      } else {
        onSelectionChange([...selectedElements, id])
      }
    } else if (e.shiftKey) {
      if (!selectedElements.includes(id)) {
        onSelectionChange([...selectedElements, id])
      }
    } else {
      onSelectionChange([id])
    }
  }

  const handleElementMove = (id: string, x: number, y: number) => {
    if (selectedElements.includes(id) && selectedElements.length > 1) {
      const element = elements.find((el) => el.id === id)
      if (element) {
        const deltaX = x - element.x
        const deltaY = y - element.y
        onMoveSelected(deltaX, deltaY)
      }
    } else {
      onUpdateElement(id, { x, y })
    }
  }

  useEffect(() => {
    if (isSelecting) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isSelecting, selectionStart])

  const selectionRect = isSelecting
    ? {
        left: Math.min(selectionStart.x, selectionEnd.x),
        top: Math.min(selectionStart.y, selectionEnd.y),
        width: Math.abs(selectionEnd.x - selectionStart.x),
        height: Math.abs(selectionEnd.y - selectionStart.y),
      }
    : null

  return (
    <div
      ref={(node) => {
        canvasRef.current = node
        drop(node)
      }}
      className={`relative w-full h-full bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg overflow-hidden cursor-crosshair ${
        isOver ? "ring-2 ring-yellow-400" : ""
      }`}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="none">
        <rect x="50" y="50" width="700" height="500" fill="none" stroke="white" strokeWidth="3" />
        <line x1="400" y1="50" x2="400" y2="550" stroke="white" strokeWidth="2" />
        <circle cx="400" cy="300" r="80" fill="none" stroke="white" strokeWidth="2" />
        <rect x="50" y="200" width="100" height="200" fill="none" stroke="white" strokeWidth="2" />
        <rect x="650" y="200" width="100" height="200" fill="none" stroke="white" strokeWidth="2" />
        <rect x="50" y="150" width="150" height="300" fill="none" stroke="white" strokeWidth="2" />
        <rect x="600" y="150" width="150" height="300" fill="none" stroke="white" strokeWidth="2" />
        <circle cx="200" cy="300" r="60" fill="none" stroke="white" strokeWidth="2" strokeDasharray="10,5" />
        <circle cx="600" cy="300" r="60" fill="none" stroke="white" strokeWidth="2" strokeDasharray="10,5" />
        <rect x="30" y="275" width="20" height="50" fill="none" stroke="white" strokeWidth="2" />
        <rect x="750" y="275" width="20" height="50" fill="none" stroke="white" strokeWidth="2" />
      </svg>

      {selectionRect && (
        <div
          className="absolute border-2 border-dashed border-yellow-400 bg-yellow-400/20 pointer-events-none"
          style={{
            left: selectionRect.left,
            top: selectionRect.top,
            width: selectionRect.width,
            height: selectionRect.height,
          }}
        />
      )}

      {isOver && (
        <div className="absolute inset-0 bg-yellow-400/20 border-2 border-dashed border-yellow-400 rounded-lg flex items-center justify-center">
          <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg font-medium">Drop here to add element</div>
        </div>
      )}

      {elements.map((element) => (
        <DrillElementComponent
          key={element.id}
          element={element}
          isSelected={selectedElements.includes(element.id)}
          onClick={(e) => handleElementClick(element.id, e)}
          onMove={handleElementMove}
          onUpdate={onUpdateElement}
        />
      ))}

      {elements.length === 0 && !isOver && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/60 text-center">
            <p className="text-lg font-medium mb-2">Drag elements from the toolbox</p>
            <p className="text-sm">Click and drag to select multiple • Ctrl+Click to toggle selection</p>
          </div>
        </div>
      )}

      {selectedElements.length > 1 && (
        <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-lg text-sm font-medium">
          {selectedElements.length} elements selected
        </div>
      )}
    </div>
  )
}
