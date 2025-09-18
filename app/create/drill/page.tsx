"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { DrillStage } from "@/components/drill-builder/drill-stage"
import { Toolbox } from "@/components/drill-builder/toolbox"
import { DrillForm } from "@/components/drill-builder/drill-form"
import { FrameControls } from "@/components/drill-builder/frame-controls"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { useRef } from "react"

export interface DrillElement {
  id: string
  type: "player" | "equipment" | "movement" | "text"
  subType: string
  x: number
  y: number
  color?: string
  label?: string
  text?: string
  size?: number // Added size property for element scaling
}

export interface DrillFrame {
  id: string
  name: string
  elements: DrillElement[]
}

export default function BuildDrillPage() {
  const [frames, setFrames] = useState<DrillFrame[]>([{ id: "frame-1", name: "Frame 1", elements: [] }])
  const stageRef = useRef<any>(null)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
  const currentFrameRef = useRef(0)
  useEffect(() => {
    currentFrameRef.current = currentFrameIndex
  }, [currentFrameIndex])
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [playerCounters, setPlayerCounters] = useState<{ [frameIndex: number]: { [key: string]: number } }>({})

  const [drillData, setDrillData] = useState({
    title: "New Training Session",
    date: "07/08/2025",
    coach: "Your name",
    gameplay: "Gameplay",
    ageGroup: "Age group",
    level: "All levels",
    players: "Available players",
  })

  const currentFrame = frames[currentFrameIndex]
  const currentPlayerCounters = playerCounters[currentFrameIndex] || {}

  const handleFrameChange = (newIndex: number) => {
    console.log("[v0] Frame change requested from", currentFrameIndex, "to", newIndex)
    setCurrentFrameIndex(newIndex)
    setSelectedElements([]) // Clear selection when changing frames
    console.log("[v0] Frame change completed, new index should be:", newIndex)
  }

  const addElement = (element: Omit<DrillElement, "id">) => {
    const newElement: DrillElement = {
      ...element,
      id: `${element.type}-${Date.now()}-${Math.random()}`,
      size: element.size || 1, // Use provided size or default to 1
    }

    const idx = currentFrameRef.current
    console.log("[v0] Adding element to frame:", idx, "Frame name:", frames[idx].name)

    if (element.type === "player" && element.subType !== "coach") {
      setPlayerCounters((prev) => ({
        ...prev,
        [idx]: {
          ...prev[idx],
          [element.subType]: (prev[idx]?.[element.subType] || 0) + 1,
        },
      }))
    }

    setFrames((prevFrames) =>
      prevFrames.map((frame, index) => (index === idx ? { ...frame, elements: [...frame.elements, newElement] } : frame)),
    )
  }

  const updateElement = (id: string, updates: Partial<DrillElement>) => {
    setFrames((prevFrames) =>
      prevFrames.map((frame, index) =>
        index === currentFrameIndex
          ? {
              ...frame,
              elements: frame.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
            }
          : frame,
      ),
    )
  }

  const removeElement = (id: string) => {
    const elementToRemove = currentFrame.elements.find((el) => el.id === id)
    if (elementToRemove && elementToRemove.type === "player" && elementToRemove.subType !== "coach") {
      setPlayerCounters((prev) => ({
        ...prev,
        [currentFrameIndex]: {
          ...prev[currentFrameIndex],
          [elementToRemove.subType]: Math.max(0, (prev[currentFrameIndex]?.[elementToRemove.subType] || 1) - 1),
        },
      }))
    }

    setFrames((prevFrames) =>
      prevFrames.map((frame, index) =>
        index === currentFrameIndex ? { ...frame, elements: frame.elements.filter((el) => el.id !== id) } : frame,
      ),
    )
  }

  const removeSelectedElements = () => {
    const elementsToRemove = currentFrame.elements.filter((el) => selectedElements.includes(el.id))
    const playerUpdates: { [key: string]: number } = {}

    elementsToRemove.forEach((element) => {
      if (element.type === "player" && element.subType !== "coach") {
        playerUpdates[element.subType] = (playerUpdates[element.subType] || 0) + 1
      }
    })

    if (Object.keys(playerUpdates).length > 0) {
      setPlayerCounters((prev) => ({
        ...prev,
        [currentFrameIndex]: {
          ...prev[currentFrameIndex],
          ...Object.keys(playerUpdates).reduce(
            (acc, key) => ({
              ...acc,
              [key]: Math.max(0, (prev[currentFrameIndex]?.[key] || 0) - playerUpdates[key]),
            }),
            {},
          ),
        },
      }))
    }

    setFrames((prevFrames) =>
      prevFrames.map((frame, index) =>
        index === currentFrameIndex
          ? { ...frame, elements: frame.elements.filter((el) => !selectedElements.includes(el.id)) }
          : frame,
      ),
    )
    setSelectedElements([])
  }

  const moveSelectedElements = (deltaX: number, deltaY: number) => {
    setFrames((prevFrames) =>
      prevFrames.map((frame, index) =>
        index === currentFrameIndex
          ? {
              ...frame,
              elements: frame.elements.map((el) =>
                selectedElements.includes(el.id)
                  ? { ...el, x: Math.max(0, el.x + deltaX), y: Math.max(0, el.y + deltaY) }
                  : el,
              ),
            }
          : frame,
      ),
    )
  }

  const clearCanvas = () => {
    setPlayerCounters((prev) => ({
      ...prev,
      [currentFrameIndex]: {},
    }))

    setFrames((prevFrames) =>
      prevFrames.map((frame, index) => (index === currentFrameIndex ? { ...frame, elements: [] } : frame)),
    )
    setSelectedElements([])
  }

  const addFrame = () => {
    const newFrame: DrillFrame = {
      id: `frame-${Date.now()}`,
      name: `Frame ${frames.length + 1}`,
      elements: [],
    }
    setFrames([...frames, newFrame])
    setCurrentFrameIndex(frames.length)
    setSelectedElements([])
  }

  const duplicateFrame = () => {
    const duplicatedFrame: DrillFrame = {
      id: `frame-${Date.now()}`,
      name: `${currentFrame.name} Copy`,
      elements: currentFrame.elements.map((el) => ({
        ...el,
        id: `${el.type}-${Date.now()}-${Math.random()}`,
      })),
    }
    setFrames([...frames, duplicatedFrame])
    setCurrentFrameIndex(frames.length)
    setSelectedElements([])
  }

  const removeFrame = (frameIndex: number) => {
    if (frames.length <= 1) return

    const newFrames = frames.filter((_, index) => index !== frameIndex)
    setFrames(newFrames)

    if (currentFrameIndex >= newFrames.length) {
      setCurrentFrameIndex(newFrames.length - 1)
    } else if (currentFrameIndex > frameIndex) {
      setCurrentFrameIndex(currentFrameIndex - 1)
    }
    setSelectedElements([])
  }

  const updateFrameName = (frameIndex: number, name: string) => {
    setFrames((prevFrames) => prevFrames.map((frame, index) => (index === frameIndex ? { ...frame, name } : frame)))
  }

  const downloadAllFrames = async () => {
    if (!stageRef.current) return
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 })
    const link = document.createElement("a")
    link.download = `${currentFrame.name.replace(/\s+/g, "_")}.png`
    link.href = dataURL
    link.click()
  }

  const getSelectedElement = () => {
    if (selectedElements.length === 1) {
      return currentFrame.elements.find((el) => el.id === selectedElements[0])
    }
    return null
  }

  const updateSelectedElement = (updates: Partial<DrillElement>) => {
    if (updates.id === "DELETE") {
      removeSelectedElements()
      return
    }

    if (selectedElements.length === 1) {
      updateElement(selectedElements[0], updates)
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />

        <div className="flex-1 flex flex-col">
          <Header />

          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-full mx-auto">
              {/* Page Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-6">BUILD A DRILL</h1>

              {/* Form Section */}
              <DrillForm data={drillData} onChange={setDrillData} />

              {/* Frame Controls */}
              <FrameControls
                frames={frames}
                currentFrameIndex={currentFrameIndex}
                onFrameChange={handleFrameChange}
                onAddFrame={addFrame}
                onDuplicateFrame={duplicateFrame}
                onRemoveFrame={removeFrame}
                onUpdateFrameName={updateFrameName}
                onDownloadAll={downloadAllFrames}
                selectedCount={selectedElements.length}
                onDeleteSelected={removeSelectedElements}
              />

              {/* Main Content Area */}
              <div className="flex gap-6 mt-6 min-h-[600px]">
                {/* Toolbox */}
                <div className="w-64">
                  <Toolbox
                    onClearCanvas={clearCanvas}
                    selectedElement={getSelectedElement()}
                    onUpdateSelected={updateSelectedElement}
                    playerCounters={currentPlayerCounters}
                    onUpdatePlayerCounters={(counters) =>
                      setPlayerCounters((prev) => ({
                        ...prev,
                        [currentFrameIndex]: counters,
                      }))
                    }
                  />
                </div>

                {/* Canvas */}
                <div className="flex-1 min-w-0">
                  <DrillStage
                    ref={stageRef}
                    elements={currentFrame.elements}
                    selectedElements={selectedElements}
                    onAddElement={addElement}
                    onUpdateElement={updateElement}
                    onRemoveElement={removeElement}
                    onSelectionChange={setSelectedElements}
                    onMoveSelected={moveSelectedElements}
                  />
                </div>
              </div>

              <div className="h-20"></div>
            </div>
          </main>
        </div>
      </div>
    </DndProvider>
  )
}
