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

export default function DrillDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [frames, setFrames] = useState<DrillFrame[] | null>(null)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
  const stageRef = useRef<any>(null)
  const [gifUrl, setGifUrl] = useState<string | null>(null)
  const [isGeneratingGif, setGeneratingGif] = useState(false)

  useEffect(() => {
    async function fetchDrill() {
      try {
        const res = await fetch(`/api/drills/${id}`)
        const raw = await res.json()
        const drill = raw.frames ? raw : raw.data // handle wrapped response
        if (res.ok && drill) {
          // transform backend → builder format
          const loadedFrames: DrillFrame[] = drill.frames.map((f: any) => ({
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
              color: "#ffffff",
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
    fetchDrill()
  }, [id])

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
            <h1 className="text-2xl font-bold mb-4">Drill #{id}</h1>

            <FrameControls
              frames={frames}
              currentFrameIndex={currentFrameIndex}
              onFrameChange={setCurrentFrameIndex}
              onAddFrame={()=>{}}
              onDuplicateFrame={()=>{}}
              onRemoveFrame={()=>{}}
              onUpdateFrameName={()=>{}}
              onDownloadAll={()=>{}}
              onExportGif={()=>{}}
              selectedCount={0}
              onDeleteSelected={()=>{}}
              isGeneratingGif={isGeneratingGif}
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
