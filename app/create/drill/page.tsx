"use client"

import { useState, useEffect, useRef } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { DrillStage } from "@/components/drill-builder/drill-stage"
import { Toolbox } from "@/components/drill-builder/toolbox"
import { DrillForm } from "@/components/drill-builder/drill-form"
import { FrameControls } from "@/components/drill-builder/frame-controls"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

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
  rotation?: number // Added rotation property for element orientation
}

export interface DrillFrame {
  id: string
  name: string
  elements: DrillElement[]
}

export default function BuildDrillPage() {
  const [frames, setFrames] = useState<DrillFrame[]>([{ id: "frame-1", name: "Frame 1", elements: [] }])
  const framesRef = useRef<DrillFrame[]>([{ id: "frame-1", name: "Frame 1", elements: [] }])
  const stageRef = useRef<any>(null)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
  const currentFrameRef = useRef(0)
  useEffect(() => {
    currentFrameRef.current = currentFrameIndex
  }, [currentFrameIndex])

  // Keep a ref with latest frames for synchronous reads (e.g., inheritance)
  useEffect(() => {
    framesRef.current = frames
  }, [frames])
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [playerCounters, setPlayerCounters] = useState<{ [frameIndex: number]: { [key: string]: number } }>({})
  const [gifUrl, setGifUrl] = useState<string | null>(null)
  const [isGifModalOpen, setGifModalOpen] = useState(false)
  const [isGeneratingGif, setGeneratingGif] = useState(false)
  const [playKey, setPlayKey] = useState(0)
  const [gifLoaded, setGifLoaded] = useState(false)

  const handleViewGif = () => setGifModalOpen(true)

  const [drillData, setDrillData] = useState({
    title: "New Training Session",
    description: "",
    date: "07/08/2025",
    coach: "Your name",
    gameplay: "Gameplay",
    ageGroup: "Age group",
    level: "All levels",
    players: "Available players",
  })

  const router = useRouter()
  const { toast } = useToast()

  const handleSaveDrill = async () => {
    try {
      const payload = {
        title: drillData.title,
        description: drillData.description || undefined,
        frames: frames.map((f, idx) => ({
          order_index: idx,
          elements: f.elements.map((el) => ({
            icon_path: `${el.type}/${el.subType}`,
            x: el.x / 900,
            y: el.y / 600,
            rotation: el.rotation || 0,
            scale: el.size || 1,
            text: el.text || null,
            color: el.color || null,
          })),
        })),
      }

      const res = await fetch("/api/drills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        toast({ title: "Drill saved" })
        router.push(`/drills/${data.id || data?.data?.id}`)
      } else {
        toast({ title: "Error", description: data.error || "Failed to save drill", variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const currentFrame = frames[currentFrameIndex]
  const currentPlayerCounters = playerCounters[currentFrameIndex] || {}

  const handleFrameChange = (newIndex: number) => {
    console.log("[v0] Frame change requested from", currentFrameIndex, "to", newIndex)
    setCurrentFrameIndex(newIndex)
    setSelectedElements([]) // Clear selection when changing frames
    console.log("[v0] Frame change completed, new index should be:", newIndex)
  }

  const addElement = (element: Omit<DrillElement, "id">) => {
    // If adding a cone, inherit attributes from last cone of same subtype
    let inherited: Partial<DrillElement> = {}
    if (element.type === "equipment" && (element.subType === "cone" || element.subType === "cone-orange" || element.subType === "cone-blue")) {
      const existing = framesRef.current[currentFrameRef.current].elements
        .filter((el) => el.type === "equipment" && el.subType === element.subType)
        .slice(-1)[0]
      if (existing) {
        inherited = {
          color: existing.color,
          size: existing.size,
          rotation: existing.rotation,
        }
      }
    }

    const newElement: DrillElement = {
      ...element,
      ...inherited,
      id: `${element.type}-${Date.now()}-${Math.random()}`,
      size: inherited.size ?? element.size ?? 1,
      rotation: inherited.rotation ?? 0,
      // Store the player number inside text so it is persisted and rendered
      text: element.type === "player" ? String(element.label ?? element.text ?? "") : element.text,
    }

    const idx = currentFrameRef.current
    console.log("[v0] Adding element to frame:", idx, "Frame name:", frames[idx].name)

    if (element.type === "player" && element.subType !== "coach") {
      const key = element.subType // team1 or team2
      setPlayerCounters((prev) => ({
        ...prev,
        [idx]: {
          ...prev[idx],
          [key]: (prev[idx]?.[key] || 0) + 1,
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
      const key = elementToRemove.subType
      setPlayerCounters((prev) => {
        const current = prev[currentFrameIndex]?.[key] || 0
        const removedNumber = parseInt(String(elementToRemove.text ?? elementToRemove.label ?? "0"), 10)
        const newCount = removedNumber === current ? Math.max(0, current - 1) : current
        return {
          ...prev,
          [currentFrameIndex]: {
            ...prev[currentFrameIndex],
            [key]: newCount,
          },
        }
      })
    }

    // remove from current and subsequent frames to maintain consistency
    setFrames((prevFrames) =>
      prevFrames.map((frame, index) =>
        index >= currentFrameIndex ? { ...frame, elements: frame.elements.filter((el) => el.id !== id) } : frame,
      ),
    )
  }

  const removeSelectedElements = () => {
    const elementsToRemove = currentFrame.elements.filter((el) => selectedElements.includes(el.id))
    if (elementsToRemove.length > 0) {
      setPlayerCounters((prev) => {
        const newFrameCounters = { ...(prev[currentFrameIndex] || {}) }
        elementsToRemove.forEach((element) => {
          if (element.type !== "player" || element.subType === "coach") return
          const key = element.subType
          const current = newFrameCounters[key] || 0
          const removedNumber = parseInt(String(element.text ?? element.label ?? "0"), 10)
          if (removedNumber === current) {
            newFrameCounters[key] = Math.max(0, current - 1)
          }
        })
        return {
          ...prev,
          [currentFrameIndex]: newFrameCounters,
        }
      })
    }

    setFrames((prevFrames) =>
      prevFrames.map((frame, index) =>
        index >= currentFrameIndex
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
        ...el, // keep original id so element is the same across frames
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
    // @ts-ignore – jsPDF is imported dynamically at runtime
    const { jsPDF } = await import("jspdf")
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [900, 600] })

    const originalIndex = currentFrameRef.current

    for (let i = 0; i < frames.length; i++) {
      setCurrentFrameIndex(i)
      await new Promise((res) => setTimeout(res, 50)) // wait for Stage to render
      const url = stageRef.current.toDataURL({ pixelRatio: 2 })
      if (i > 0) pdf.addPage()
      pdf.addImage(url, "PNG", 0, 0, 900, 600)
    }

    // restore original frame
    setCurrentFrameIndex(originalIndex)

    pdf.save("training_frames.pdf")
  }

  // === GIF EXPORT ===
  const exportGif = async ({ delay, width }: { delay: number; width: number }) => {
    setGeneratingGif(true)
    // Uso la versión browser que embebe el worker, así evitamos problemas de CORS
    // @ts-ignore – librería no tiene tipos
    const { default: GIF } = await import("gif.js")
    const steps = 10 // interpolation steps between keyframes
    const aspect = 600 / 900
    const gifWidth = width
    const gifHeight = Math.round(width * aspect)

    const renderSnapshot = async () => {
      await new Promise((res) => setTimeout(res, 30))
      return stageRef.current.toDataURL({ pixelRatio: 2 })
    }

    const originalFrames = JSON.parse(JSON.stringify(frames)) as DrillFrame[]

    const framesData: { src: string; d: number }[] = []

    for (let i = 0; i < frames.length; i++) {
      setCurrentFrameIndex(i)
      framesData.push({ src: await renderSnapshot(), d: delay })

      const next = frames[i + 1]
      if (!next) break

      const startMap: Record<string, DrillElement> = {}
      frames[i].elements.forEach((el) => (startMap[el.id] = el))
      const endMap: Record<string, DrillElement> = {}
      next.elements.forEach((el) => (endMap[el.id] = el))

      for (let s = 1; s < steps; s++) {
        const t = s / steps
        const interpElements: DrillElement[] = frames[i].elements.map((el) => {
          const end = endMap[el.id] || el
          return {
            ...el,
            x: el.x + (end.x - el.x) * t,
            y: el.y + (end.y - el.y) * t,
            rotation: (el.rotation || 0) + ((end.rotation || 0) - (el.rotation || 0)) * t,
            size: (el.size || 1) + ((end.size || 1) - (el.size || 1)) * t,
          }
        })

        setFrames((prev) => prev.map((f, idx) => (idx === i ? { ...f, elements: interpElements } : f)))
        framesData.push({ src: await renderSnapshot(), d: delay / steps })
      }
    }

    setFrames(originalFrames)

    const gif = new GIF({
      workerScript: "/gif.worker.js",
      repeat: -1, // no loop
    })

    const loadImage = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.src = src
      })

    for (const { src, d } of framesData) {
      const imgEl = await loadImage(src)
      gif.addFrame(imgEl, { delay: d, copy: true })
    }

    gif.on("finished", (blob: Blob) => {
      setGifUrl(URL.createObjectURL(blob))
      setGeneratingGif(false)
    })

    gif.render()
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

              {/* Save Drill CTA */}
              <div className="mb-4">
                <Button onClick={handleSaveDrill} variant="default">Save Drill</Button>
              </div>

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
                onExportGif={exportGif}
                selectedCount={selectedElements.length}
                onDeleteSelected={removeSelectedElements}
                gifUrl={gifUrl}
                onViewGif={handleViewGif}
                isGeneratingGif={isGeneratingGif}
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
                <div>
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
      <Dialog open={isGifModalOpen && !!gifUrl} onOpenChange={setGifModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Preview GIF</DialogTitle>
          </DialogHeader>
          {gifUrl && (
            <img
              key={playKey}
              src={gifUrl}
              alt="Drill animation"
              className={`w-full h-auto transition-opacity duration-150 ${gifLoaded?'opacity-100':'opacity-0'}`}
              style={{ imageRendering: "pixelated" }}
              onLoad={()=>setGifLoaded(true)}
            />
          )}
          <DialogFooter>
            {gifUrl && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setGifLoaded(false)
                  setPlayKey((k)=>k+1)
                }}
              >
                Play Again
              </Button>
            )}
            {gifUrl && (
              <a
                href={gifUrl}
                download="training_frames.gif"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
              >
                Download
              </a>
            )}
            <DialogClose className="inline-flex items-center px-4 py-2 bg-gray-200 rounded-md text-sm">Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndProvider>
  )
}
