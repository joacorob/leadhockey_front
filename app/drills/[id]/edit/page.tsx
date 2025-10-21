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
import { Download, Save } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
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
  size?: number
  rotation?: number
}

export interface DrillFrame {
  id: string
  name: string
  elements: DrillElement[]
}

export default function EditDrillPage() {
  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [frames, setFrames] = useState<DrillFrame[]>([{ id: "frame-1", name: "Frame 1", elements: [] }])
  const framesRef = useRef<DrillFrame[]>([{ id: "frame-1", name: "Frame 1", elements: [] }])
  const stageRef = useRef<any>(null)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
  const currentFrameRef = useRef(0)
  useEffect(() => {
    currentFrameRef.current = currentFrameIndex
  }, [currentFrameIndex])

  useEffect(() => {
    framesRef.current = frames
  }, [frames])
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [playerCounters, setPlayerCounters] = useState<{ [frameIndex: number]: { [key: string]: number } }>({})
  const [gifUrl, setGifUrl] = useState<string | null>(null)
  const [cachedGifBase64, setCachedGifBase64] = useState<string | null>(null)
  const [isGifModalOpen, setGifModalOpen] = useState(false)
  const [isGeneratingGif, setGeneratingGif] = useState(false)
  const [isSavingDrill, setSavingDrill] = useState(false)
  const [speed, setSpeed] = useState<'slow' | 'regular' | 'fast'>('regular')
  const [isDownloadingVideo, setDownloadingVideo] = useState(false)
  const [playKey, setPlayKey] = useState(0)
  const [gifLoaded, setGifLoaded] = useState(false)
  
  // Keep track of existing thumbnail and animation URLs to avoid re-uploading
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null)
  const [existingAnimationGifUrl, setExistingAnimationGifUrl] = useState<string | null>(null)
  const [existingAnimationVideoUrl, setExistingAnimationVideoUrl] = useState<string | null>(null)
  
  // Keep original frames to detect canvas changes
  const [originalFrames, setOriginalFrames] = useState<DrillFrame[] | null>(null)

  const invalidateGifCache = () => {
    setGifUrl(null)
    setCachedGifBase64(null)
  }

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

  // Load existing drill data on mount
  useEffect(() => {
    async function loadDrill() {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/drills/${id}`)
        const raw = await res.json()
        const drillObj = raw.frames ? raw : raw.data

        if (res.ok && drillObj) {
          // Map backend data to form
          setDrillData({
            title: drillObj.title || "Untitled Drill",
            description: drillObj.description || "",
            date: drillObj.date || new Date().toISOString().slice(0, 10),
            coach: drillObj.coach || "Your name",
            gameplay: drillObj.gameplay || "Gameplay",
            ageGroup: drillObj.ageGroup || "Age group",
            level: drillObj.level || "All levels",
            players: drillObj.players || "Available players",
          })

          // Store existing URLs
          setExistingThumbnailUrl(drillObj.thumbnailUrl || null)
          setExistingAnimationGifUrl(drillObj.animationGifUrl || null)
          setExistingAnimationVideoUrl(drillObj.animationVideoUrl || null)

          // Transform backend frames → builder format
          const loadedFrames: DrillFrame[] = drillObj.frames.map((f: any) => ({
            id: `frame-${f.id}`,
            name: `Frame ${f.order_index + 1}`,
            elements: f.elements.map((el: any): DrillElement => ({
              id: `el-${el.id}`,
              type: el.icon_path.split("/")[0],
              subType: el.icon_path.split("/")[1],
              x: el.x * 900,
              y: el.y * 600,
              rotation: el.rotation || 0,
              size: el.scale || 1,
              text: el.text || undefined,
              color: el.color || undefined,
            })),
          }))
          const finalFrames = loadedFrames.length > 0 ? loadedFrames : [{ id: "frame-1", name: "Frame 1", elements: [] }]
          setFrames(finalFrames)
          // Store original frames for change detection
          setOriginalFrames(JSON.parse(JSON.stringify(finalFrames)))
        } else {
          toast({ title: "Error", description: raw.error || raw.message, variant: "destructive" })
        }
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }

    loadDrill()
  }, [id, toast])

  // Check if frames have changed since load
  const framesHaveChanged = (): boolean => {
    if (!originalFrames) return true // No original frames loaded, assume changes
    
    // Compare structure: number of frames and elements
    if (frames.length !== originalFrames.length) return true
    
    for (let i = 0; i < frames.length; i++) {
      const current = frames[i]
      const original = originalFrames[i]
      
      if (current.elements.length !== original.elements.length) return true
      
      // Compare each element's position, rotation, size, etc.
      for (let j = 0; j < current.elements.length; j++) {
        const currEl = current.elements[j]
        const origEl = original.elements[j]
        
        if (
          currEl.type !== origEl.type ||
          currEl.subType !== origEl.subType ||
          Math.abs(currEl.x - origEl.x) > 0.1 ||
          Math.abs(currEl.y - origEl.y) > 0.1 ||
          Math.abs((currEl.rotation || 0) - (origEl.rotation || 0)) > 0.1 ||
          Math.abs((currEl.size || 1) - (origEl.size || 1)) > 0.01 ||
          currEl.text !== origEl.text ||
          currEl.color !== origEl.color
        ) {
          return true
        }
      }
    }
    
    return false
  }

  const captureThumbnail = async (): Promise<string | undefined> => {
    if (!stageRef.current) return undefined

    const originalIndex = currentFrameRef.current

    if (originalIndex !== 0) {
      setCurrentFrameIndex(0)
      await new Promise((res) => setTimeout(res, 50))
    }

    const dataUrl: string = stageRef.current.toDataURL({ pixelRatio: 2, mimeType: "image/png" })

    if (originalIndex !== 0) {
      setCurrentFrameIndex(originalIndex)
    }

    // Strip "data:image/png;base64," prefix
    return dataUrl.replace(/^data:image\/png;base64,/, "")
  }

  const handleSaveDrill = async () => {
    setSavingDrill(true)
    try {
      // Check if canvas/frames have changed
      const canvasChanged = framesHaveChanged()
      
      // Capture thumbnail (PNG) - always capture new thumbnail from current state
      const thumbnailBase64 = await captureThumbnail()
      
      // Only generate animation if frames changed
      let animationGifBase64: string | undefined
      
      if (canvasChanged) {
        // Frames changed, need to regenerate animation
        if (cachedGifBase64) {
          animationGifBase64 = cachedGifBase64
        } else {
          try {
            animationGifBase64 = (await exportGif({ 
              delay: delayMap[speed], 
              width: 900, 
              returnBase64: true 
            })) as string
          } catch (gifError: any) {
            toast({ 
              title: "Error generating animation", 
              description: gifError.message || "Failed to create drill animation",
              variant: "destructive" 
            })
            setSavingDrill(false)
            return
          }
        }
      }
      // If !canvasChanged, don't send animation_gif - backend will keep existing one

      const payload: any = {
        title: drillData.title,
        description: drillData.description || undefined,
        thumbnailBase64: thumbnailBase64, // backend expects this field name per doc
        frames: frames.map((f, idx) => ({
          order_index: idx + 1, // 1-based per doc
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

      // Only include animation_gif if frames changed
      if (canvasChanged && animationGifBase64) {
        payload.animation_gif = animationGifBase64 // backend will upload and convert to MP4
      }

      const res = await fetch(`/api/drills/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        // Clean up preview URL and cache after successful save
        if (gifUrl) {
          URL.revokeObjectURL(gifUrl)
        }
        invalidateGifCache()
        toast({ 
          title: "Drill updated successfully",
          description: canvasChanged ? "Animation regenerated" : "Animation unchanged"
        })
        router.push(`/drills/${id}`)
      } else {
        toast({ title: "Error", description: data.error || "Failed to update drill", variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setSavingDrill(false)
    }
  }

  const currentFrame = frames[currentFrameIndex]
  const currentPlayerCounters = playerCounters[currentFrameIndex] || {}

  const handleFrameChange = (newIndex: number) => {
    setCurrentFrameIndex(newIndex)
    setSelectedElements([])
  }

  const addElement = (element: Omit<DrillElement, "id">) => {
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
      text: element.type === "player" ? String(element.label ?? element.text ?? "") : element.text,
    }

    const idx = currentFrameRef.current

    if (element.type === "player" && element.subType !== "coach") {
      const key = element.subType
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
    invalidateGifCache()
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
    invalidateGifCache()
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

    setFrames((prevFrames) =>
      prevFrames.map((frame, index) =>
        index >= currentFrameIndex ? { ...frame, elements: frame.elements.filter((el) => el.id !== id) } : frame,
      ),
    )
    invalidateGifCache()
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
    invalidateGifCache()
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
    invalidateGifCache()
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
    invalidateGifCache()
  }

  const duplicateFrame = () => {
    const duplicatedFrame: DrillFrame = {
      id: `frame-${Date.now()}`,
      name: `${currentFrame.name} Copy`,
      elements: currentFrame.elements.map((el) => ({
        ...el,
      })),
    }
    setFrames([...frames, duplicatedFrame])
    setCurrentFrameIndex(frames.length)
    setSelectedElements([])
    invalidateGifCache()
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
    invalidateGifCache()
  }

  const updateFrameName = (frameIndex: number, name: string) => {
    setFrames((prevFrames) => prevFrames.map((frame, index) => (index === frameIndex ? { ...frame, name } : frame)))
  }

  const downloadAllFrames = async () => {
    // @ts-ignore
    const { jsPDF } = await import("jspdf")
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [900, 600] })

    const originalIndex = currentFrameRef.current

    for (let i = 0; i < frames.length; i++) {
      setCurrentFrameIndex(i)
      await new Promise((res) => setTimeout(res, 50))
      const url = stageRef.current.toDataURL({ pixelRatio: 2 })
      if (i > 0) pdf.addPage()
      pdf.addImage(url, "PNG", 0, 0, 900, 600)
    }

    setCurrentFrameIndex(originalIndex)

    pdf.save("training_frames.pdf")
  }

  const exportGif = async ({ delay, width, returnBase64 = false }: { delay: number; width: number; returnBase64?: boolean }): Promise<string | void> => {
    setGeneratingGif(true)
    try {
      // @ts-ignore
      const { default: GIF } = await import("gif.js")
      const steps = 10
      const aspect = 600 / 900
      const gifWidth = width
      const gifHeight = Math.round(width * aspect)

      const renderSnapshot = async () => {
        await new Promise((res) => setTimeout(res, 30))
        return stageRef.current.toDataURL({ pixelRatio: 2 })
      }

      const originalFrames = JSON.parse(JSON.stringify(frames)) as DrillFrame[]
      const originalIndex = currentFrameRef.current

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
      setCurrentFrameIndex(originalIndex)

      const gif = new GIF({
        workerScript: "/gif.worker.js",
        repeat: -1,
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

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          setGeneratingGif(false)
          reject(new Error("GIF generation timed out"))
        }, 60000)

        gif.on("finished", async (blob: Blob) => {
          clearTimeout(timeout)
          
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64 = (reader.result as string).replace(/^data:image\/gif;base64,/, "")
            setCachedGifBase64(base64)
            
            if (returnBase64) {
              setGeneratingGif(false)
              resolve(base64)
            } else {
              setGifUrl(URL.createObjectURL(blob))
              setGeneratingGif(false)
              resolve()
            }
          }
          reader.onerror = () => {
            setGeneratingGif(false)
            reject(new Error("Failed to convert GIF to base64"))
          }
          reader.readAsDataURL(blob)
        })

        gif.render()
      })
    } catch (err) {
      setGeneratingGif(false)
      throw err
    }
  }

  const handleDownloadVideo = async () => {
    if (gifUrl) {
      const link = document.createElement('a')
      link.href = gifUrl
      link.download = 'training_frames.gif'
      document.body.appendChild(link)
      link.click()
      link.remove()
      return
    }
    setDownloadingVideo(true)
    await exportGif({ delay: delayMap[speed], width: 900 })
    setDownloadingVideo(false)
    if (gifUrl) {
      handleDownloadVideo()
    }
  }

  const delayMap: { [k in 'slow' | 'regular' | 'fast']: number } = { slow: 1200, regular: 800, fast: 400 }

  const handlePreviewVideo = async () => {
    if (gifUrl && !isGeneratingGif) {
      setGifModalOpen(true)
      return
    }
    await exportGif({ delay: delayMap[speed], width: 900 })
    setGifModalOpen(true)
  }

  const handleSpeedChange = (s: 'slow' | 'regular' | 'fast') => {
    setSpeed(s)
    invalidateGifCache()
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

  if (isLoading) {
    return (
      <DndProvider backend={HTML5Backend}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-gray-600">
                <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span>Loading drill…</span>
              </div>
            </main>
          </div>
        </div>
      </DndProvider>
    )
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
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">EDIT DRILL</h1>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveDrill}
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isSavingDrill || isGeneratingGif}
                  >
                    {isSavingDrill || isGeneratingGif ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        {isGeneratingGif && !cachedGifBase64 ? "Generating animation…" : "Saving changes…"}
                      </span>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1" />
                        Save Changes
                      </>
                    )}
                  </Button>

                  <Button onClick={downloadAllFrames} variant="default" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Download PDF
                  </Button>

                  <Button
                    onClick={handleDownloadVideo}
                    variant="default"
                    size="sm"
                    disabled={isDownloadingVideo || isGeneratingGif}
                  >
                    {isDownloadingVideo || isGeneratingGif ? (
                      "Generating video…"
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-1" />
                        Download Video
                      </>
                    )}
                  </Button>
                </div>
              </div>

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
                onPreviewVideo={handlePreviewVideo}
                speed={speed}
                onChangeSpeed={handleSpeedChange}
                isGenerating={isGeneratingGif}
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
              className={`w-full h-auto transition-opacity duration-150 ${gifLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{ imageRendering: "pixelated" }}
              onLoad={() => setGifLoaded(true)}
            />
          )}
          <DialogFooter>
            {gifUrl && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setGifLoaded(false)
                  setPlayKey((k) => k + 1)
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

