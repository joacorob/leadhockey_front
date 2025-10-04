"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { DrillStage } from "@/components/drill-builder/drill-stage"
import { Button } from "@/components/ui/button"
import { FrameControls } from "@/components/drill-builder/frame-controls"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { DrillFrame, DrillElement } from "@/app/create/drill/page"
import { useToast } from "@/hooks/use-toast"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Card, CardContent } from "@/components/ui/card"
import { AnimationDownloadDropdown } from "@/components/drill-builder/animation-download-dropdown"

export default function DrillDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [frames, setFrames] = useState<DrillFrame[] | null>(null)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
  const stageRef = useRef<any>(null)
  const [drill, setDrill] = useState<any>(null)
  const [animationVideoStatus, setAnimationVideoStatus] = useState<"pending" | "success" | "error" | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchDrill = async () => {
    try {
      const res = await fetch(`/api/drills/${id}`)
      const raw = await res.json()
      const drillObj = raw.frames ? raw : raw.data
      if (res.ok && drillObj) {
        setDrill(drillObj)
        setAnimationVideoStatus(drillObj.animationVideoStatus || null)
        
        // transform backend → builder format
        const loadedFrames: DrillFrame[] = drillObj.frames.map((f: any) => ({
          id: `frame-${f.id}`,
          name: `Frame ${f.order_index + 1}`,
          elements: f.elements.map((el: any): DrillElement => ({
            id: `el-${el.id}`,
            type: el.icon_path.split("/")[0],
            subType: el.icon_path.split("/")[1],
            x: el.x * 900,
            y: el.y * 600,
            rotation: el.rotation,
            size: el.scale,
            text: el.text || undefined,
            color: el.color || undefined,
          })),
        }))
        setFrames(loadedFrames)
      } else {
        toast({ title: "Error", description: raw.error || raw.message })
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message })
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchDrill()
  }, [id])

  // Polling for pending status
  useEffect(() => {
    if (animationVideoStatus === "pending") {
      // Poll every 10 seconds
      pollingIntervalRef.current = setInterval(() => {
        fetchDrill()
      }, 10000)
    } else {
      // Clear polling if not pending
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [animationVideoStatus, id])

  if (!frames) {
    return (
      <DndProvider backend={HTML5Backend}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-6 overflow-auto flex items-center justify-center">
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
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">{drill?.title}</h1>
              <AnimationDownloadDropdown
                animationGifUrl={drill?.animationGifUrl}
                animationVideoUrl={drill?.animationVideoUrl}
                animationVideoStatus={animationVideoStatus}
                drillTitle={drill?.title}
              />
            </div>

            {drill?.description && (
              <Card className="mb-6">
                <CardContent className="prose max-w-none py-4" dangerouslySetInnerHTML={{ __html: drill.description }} />
              </Card>
            )}

            {/* Animation Preview */}
            {drill?.animationGifUrl && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">ANIMATION PREVIEW</h3>
                  <div className="flex justify-center bg-gray-100 rounded-lg p-4">
                    {animationVideoStatus === "success" && drill?.animationVideoUrl ? (
                      <video
                        src={drill.animationVideoUrl}
                        controls
                        loop
                        className="max-w-full h-auto rounded shadow"
                        style={{ maxHeight: "400px" }}
                      />
                    ) : (
                      <img
                        src={drill.animationGifUrl}
                        alt="Drill animation"
                        className="max-w-full h-auto rounded shadow"
                        style={{ maxHeight: "400px" }}
                      />
                    )}
                  </div>
                  {animationVideoStatus === "pending" && (
                    <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      <span>Converting to MP4 video... (showing GIF preview)</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <FrameControls
              frames={frames}
              currentFrameIndex={currentFrameIndex}
              onFrameChange={setCurrentFrameIndex}
              onAddFrame={()=>{}}
              onDuplicateFrame={()=>{}}
              onRemoveFrame={()=>{}}
              onUpdateFrameName={()=>{}}
              onDownloadAll={()=>{}}
              onPreviewVideo={()=>{}}
              speed="regular"
              onChangeSpeed={()=>{}}
              selectedCount={0}
              onDeleteSelected={()=>{}}
              readOnly
            />

            <div className="mt-6">
              <DrillStage
                ref={stageRef}
                elements={frames[currentFrameIndex].elements}
                selectedElements={[]}
                onAddElement={()=>{}}
                onUpdateElement={()=>{}}
                onRemoveElement={()=>{}}
                onSelectionChange={()=>{}}
                onMoveSelected={()=>{}}
                interactive={false}
              />
            </div>
          </main>
        </div>
      </div>
    </DndProvider>
  )
}
