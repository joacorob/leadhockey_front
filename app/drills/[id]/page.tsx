"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { DrillStage } from "@/components/drill-builder/drill-stage"
import { FrameControls } from "@/components/drill-builder/frame-controls"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { DrillFrame, DrillElement } from "@/app/create/drill/page"
import { useToast } from "@/hooks/use-toast"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Card, CardContent } from "@/components/ui/card"
import { AnimationDownloadDropdown } from "@/components/drill-builder/animation-download-dropdown"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RelatedVideos } from "@/components/video/related-videos"
import { useApi } from "@/lib/hooks/use-api"

export default function DrillDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [frames, setFrames] = useState<DrillFrame[] | null>(null)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
  const stageRef = useRef<any>(null)
  const [drill, setDrill] = useState<any>(null)
  const [animationVideoStatus, setAnimationVideoStatus] = useState<"pending" | "success" | "error" | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { data: playlistResponse } = useApi(`/playlists/${id}`)

  const drillDataMemo = useMemo(() => {
    const raw = drill
    if (!raw) return null
    return {
      id: raw.id,
      title: raw.title ?? "Untitled Drill",
      description: raw.description ?? "",
      animationGifUrl: raw.animationGifUrl ?? null,
      animationVideoUrl: raw.animationVideoUrl ?? null,
      animationVideoStatus: raw.animationVideoStatus ?? null,
      pdfs: Array.isArray(raw.pdfs) ? raw.pdfs : [],
    }
  }, [drill])

  const hasVideo = drillDataMemo?.animationVideoStatus === "success" && !!drillDataMemo?.animationVideoUrl
  const hasGif = !!drillDataMemo?.animationGifUrl

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

  if (!drillDataMemo) {
    return (
      <DndProvider backend={HTML5Backend}>
        <div className="flex h-screen bg-gray-50">
          <div className="hidden lg:block">
            <Sidebar />
          </div>
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

  const documents = drillDataMemo.pdfs.map((pdf) => ({
    id: String(pdf.id ?? crypto.randomUUID()),
    name: pdf.name ?? `document-${pdf.id ?? ""}`,
    size: pdf.size ? `${(pdf.size / (1024 * 1024)).toFixed(1)} MB` : "",
    url: pdf.url ?? pdf.link ?? pdf.path ?? "",
  }))

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-gray-50">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
                <div className="flex-1 space-y-4 lg:space-y-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">{drillDataMemo.title}</h1>
                      </div>
                      <div className="flex items-center gap-2">
                        
                        <AnimationDownloadDropdown
                          animationGifUrl={drillDataMemo.animationGifUrl}
                          animationVideoUrl={drillDataMemo.animationVideoUrl}
                          animationVideoStatus={drillDataMemo.animationVideoStatus}
                          drillTitle={drillDataMemo.title}
                        />
                      </div>
                    </div>

                    {hasVideo || hasGif ? (
                    <Card className="bg-black">
                      <CardContent className="p-0">
                        {hasVideo ? (
                          <video
                            key={drillDataMemo.animationVideoUrl}
                            src={drillDataMemo.animationVideoUrl ?? undefined}
                            controls
                            loop
                            className="w-full h-full"
                          />
                        ) : (
                          <img
                            src={drillDataMemo.animationGifUrl ?? ""}
                            alt="Drill animation"
                            className="w-full h-full object-contain bg-black"
                          />
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="py-16 flex items-center justify-center text-gray-500">No animation available.</CardContent>
                    </Card>
                  )}

                    {drillDataMemo.description && (
                      <Card>
                        <CardContent className="prose max-w-none py-4" dangerouslySetInnerHTML={{ __html: drillDataMemo.description }} />
                      </Card>
                    )}
                  </div>

                  {documents.length > 0 && (
                    <div className="lg:hidden">
                      <Tabs defaultValue="documents" className="w-full">
                        <TabsList className="grid w-full grid-cols-1">
                          <TabsTrigger value="documents">Documents</TabsTrigger>
                        </TabsList>
                        <TabsContent value="documents">
                          <ul className="space-y-3 mt-4">
                            {documents.map((doc) => (
                              <li key={doc.id}>
                                <a href={doc.url} className="text-sm text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                                  {doc.name}
                                </a>
                                {doc.size && <p className="text-xs text-gray-500">{doc.size}</p>}
                              </li>
                            ))}
                          </ul>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}

                  {!hasVideo && hasGif && frames && (
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <FrameControls
                          frames={frames}
                          currentFrameIndex={currentFrameIndex}
                          onFrameChange={setCurrentFrameIndex}
                          onAddFrame={() => {}}
                          onDuplicateFrame={() => {}}
                          onRemoveFrame={() => {}}
                          onUpdateFrameName={() => {}}
                          onDownloadAll={() => {}}
                          onPreviewVideo={() => {}}
                          speed="regular"
                          onChangeSpeed={() => {}}
                          selectedCount={0}
                          onDeleteSelected={() => {}}
                          readOnly
                        />

                        <div className="border rounded-lg">
                          <DrillStage
                            ref={stageRef}
                            elements={frames[currentFrameIndex]?.elements ?? []}
                            selectedElements={[]}
                            onAddElement={() => {}}
                            onUpdateElement={() => {}}
                            onRemoveElement={() => {}}
                            onSelectionChange={() => {}}
                            onMoveSelected={() => {}}
                            interactive={false}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {Array.isArray((playlistResponse as any)?.data?.sessions) && (playlistResponse as any).data?.sessions.length > 0 && (
                  <aside className="hidden lg:block w-80">
                    <RelatedVideos playlistData={playlistResponse?.data ?? {}} />
                  </aside>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </DndProvider>
  )
}
