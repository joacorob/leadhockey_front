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
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { RelatedVideos } from "@/components/video/related-videos"
import { useApi } from "@/lib/hooks/use-api"
import { mapRelatedItem } from "@/lib/types/related-videos"

export default function DrillDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [frames, setFrames] = useState<DrillFrame[] | null>(null)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
  const stageRef = useRef<any>(null)
  const pdfStageRef = useRef<any>(null)
  const [drill, setDrill] = useState<any>(null)
  const [animationVideoStatus, setAnimationVideoStatus] = useState<"pending" | "success" | "error" | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isDownloadingPdf, setDownloadingPdf] = useState(false)

  const { data: relatedResponse } = useApi(`/related-videos/${id}`, {
    type: "DRILL",
  })
  const relatedData = (relatedResponse as any)?.data ?? relatedResponse
  const relatedItems = Array.isArray(relatedData?.items)
    ? relatedData.items.map((item: any) => mapRelatedItem(item, id)).filter(Boolean)
    : []

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

  const downloadPdf = async () => {
    if (!frames || frames.length === 0 || !pdfStageRef.current) return
    setDownloadingPdf(true)
    try {
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF({ orientation: "portrait", unit: "px", format: [600, 900] })

      const parseHtmlToText = (html: string) => {
        if (!html) return ""
        const parser = new DOMParser()
        const parsed = parser.parseFromString(html, "text/html")
        return parsed.body.textContent?.replace(/\s+/g, " ").trim() ?? ""
      }
      const descriptionText = parseHtmlToText(drillDataMemo.description)

      await new Promise((res) => setTimeout(res, 150))
      const frameImage = pdfStageRef.current.toDataURL({ pixelRatio: 2 })

      // Background & header
      doc.setFillColor(248, 250, 252)
      doc.rect(0, 0, 600, 900, "F")

      doc.setFillColor(30, 64, 175)
      doc.rect(0, 0, 600, 170, "F")

      doc.setFillColor(59, 130, 246)
      doc.rect(0, 170, 600, 24, "F")

      // Header with logo and title
      const logoUrl = "https://uploadthingy.s3.us-west-1.amazonaws.com/nzVf7cqEycpaU4k9WPUBYZ/LEAD_logo.png"
      try {
        const imageResponse = await fetch(logoUrl)
        const blob = await imageResponse.blob()
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
        doc.addImage(dataUrl, "PNG", 40, 45, 120, 60)
      } catch (logoError) {
        console.error("Failed to load logo", logoError)
      }

      doc.setFont("helvetica", "bold")
      doc.setFontSize(28)
      doc.setTextColor(255, 255, 255)
      doc.text(drillDataMemo.title, 190, 85)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(13)
      doc.setTextColor(226, 232, 240)
      doc.text("Share this drill with your staff & team", 190, 113)

      doc.setFillColor(148, 163, 184)
      doc.roundedRect(190, 124, 180, 22, 11, 11, "F")
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(30, 41, 59)
      doc.text("Powered by Lead Hockey", 200, 139)

      if (frameImage) {
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(40, 220, 520, 330, 18, 18, "F")
        doc.setDrawColor(226, 232, 240)
        doc.roundedRect(40, 220, 520, 330, 18, 18, "S")
        const imageWidth = 500
        const imageHeight = (imageWidth * 600) / 900
        const imageX = 50
        const imageY = 232
        doc.addImage(frameImage, "PNG", imageX, imageY, imageWidth, imageHeight)
      }

      if (descriptionText) {
        doc.setFillColor(255, 255, 255)
        const lines = doc.splitTextToSize(descriptionText, 480)
        const textHeight = lines.length * 18 + 40
        const boxHeight = Math.min(Math.max(textHeight, 120), 260)
        const boxY = 570
        doc.roundedRect(40, boxY, 520, boxHeight, 18, 18, "F")
        doc.setDrawColor(209, 213, 219)
        doc.roundedRect(40, boxY, 520, boxHeight, 18, 18, "S")
        doc.setFont("helvetica", "bold")
        doc.setFontSize(17)
        doc.setTextColor(17, 24, 39)
        doc.text("Drill Description", 60, boxY + 36)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(14)
        doc.setTextColor(55, 65, 81)
        doc.text(lines, 60, boxY + 64)
      }

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.setTextColor(107, 114, 128)
      doc.text("Lead Hockey", 40, 840)
      doc.text(new Date().toLocaleDateString(), 560, 840, { align: "right" })

      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.setTextColor(30, 41, 59)
      doc.text("www.leadhockey.com", 40, 858)
      doc.text("Inspire. Teach. Elevate.", 560, 858, { align: "right" })

      doc.save(`${drillDataMemo.title.replace(/\s+/g, "-").toLowerCase()}-drill.pdf`)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to download PDF" })
    } finally {
      setDownloadingPdf(false)
    }
  }

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
                        <p className="mt-1 text-sm text-gray-600">Download the animation, frames PDF, and other resources for this drill.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        
                        <AnimationDownloadDropdown
                          animationGifUrl={drillDataMemo.animationGifUrl}
                          animationVideoUrl={drillDataMemo.animationVideoUrl}
                          animationVideoStatus={drillDataMemo.animationVideoStatus}
                          drillTitle={drillDataMemo.title}
                        />
                        {frames && frames.length > 0 && (
                          <Button onClick={downloadPdf} size="sm" variant="outline" disabled={isDownloadingPdf}>
                            {isDownloadingPdf ? (
                              <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                                Generating PDF…
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Download PDF
                              </span>
                            )}
                          </Button>
                        )}
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

                {relatedItems.length > 0 && (
                  <aside className="hidden lg:block w-80">
                    <RelatedVideos
                      title={relatedData?.title}
                      source={relatedData?.source}
                      items={relatedItems}
                    />
                  </aside>
                )}
              </div>
            </div>
          </main>
          {frames && (
            <div
              aria-hidden
              className="pointer-events-none"
              style={{ position: "absolute", left: "-10000px", top: "-10000px" }}
            >
              <DrillStage
                ref={pdfStageRef}
                elements={frames[0]?.elements ?? []}
                selectedElements={[]}
                onAddElement={() => {}}
                onUpdateElement={() => {}}
                onRemoveElement={() => {}}
                onSelectionChange={() => {}}
                onMoveSelected={() => {}}
                interactive={false}
              />
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  )
}
