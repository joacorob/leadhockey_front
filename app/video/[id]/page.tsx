"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { VideoPlayer } from "@/components/video/video-player"
import { VideoInfo } from "@/components/video/video-info"
import { VideoDocuments } from "@/components/video/video-documents"
import { VideoComments } from "@/components/video/video-comments"
import { RelatedVideos } from "@/components/video/related-videos"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApi } from "@/lib/hooks/use-api"
import { Button } from "@/components/ui/button"

function VideoViewContent() {
  const params = useParams()
  const paramId = (params as Record<string, unknown>)?.id
  const videoId = Array.isArray(paramId) ? (paramId[0] as string) : ((paramId as string) ?? "")

  // Fetch video data using useApi hook
  const { data: apiResponse, loading, error } = useApi(`/videos/${videoId}`)
  const rawVideoData = (apiResponse as any)?.data ?? apiResponse
  const videoData =
    rawVideoData && typeof rawVideoData === "object" && !Array.isArray(rawVideoData)
      ? rawVideoData
      : null

  const { data: apiPlaylistResponse, loading: loadingPlaylist, error: errorPlaylist } = useApi(`/playlists/${videoId}`)
  const playlistData = (apiPlaylistResponse as any)?.data ?? apiPlaylistResponse

  // Map API response to UI shape expected by VideoInfo component
  const mappedVideo = videoData && videoData.id
    ? {
        id: String(videoData.id),
        title: videoData.title ?? "Untitled video",
        description: typeof videoData.description === "string" ? videoData.description : "",
        videoUrl: videoData.videoProcessedUrl ?? videoData.videoUrl ?? "",
        duration: videoData.duration,
        views: videoData.views ?? 0,
        likes: videoData.likes ?? 0,
        uploadDate: videoData.createdAt ?? videoData.updatedAt ?? new Date().toISOString(),
        category: "Training", // Placeholder – you may map categoryId -> name
        tags: Array.isArray(videoData.tags) ? videoData.tags : [],
        owner: {
          name: "Uploader", // API does not provide owner details yet
          avatar: "/placeholder-user.jpg",
          bio: "",
          credentials: "",
        },
      }
    : null

  const isVideoUnavailable = !loading && (!mappedVideo || !!error)
  const isDataReady = !loading && !error && !!mappedVideo

  const documents = Array.isArray(videoData?.pdfs)
    ? videoData.pdfs.map((pdf: any) => ({
        id: String(pdf.id),
        name: pdf.name ?? `document-${pdf.id}.pdf`,
        type: "PDF",
        size: pdf.size ? `${(pdf.size / (1024 * 1024)).toFixed(1)} MB` : "",
        description: "Training resource",
        url: pdf.url ?? pdf.link ?? pdf.path ?? `/${pdf.id}.pdf`,
      }))
    : []

  const subtitles = Array.isArray(videoData?.subtitles)
    ? videoData.subtitles.map((sub: any) => ({
        url: `/api/subtitle-proxy?url=${encodeURIComponent(sub.url)}`,
        label: sub.label ?? sub.language,
        language: sub.language,
        format: sub.format,
      }))
    : []

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
              {/* Main Content */}
              <div className="flex-1 space-y-4 lg:space-y-6">
                {/* Video Player */}
                {loading ? (
                  <div className="flex justify-center items-center h-64 bg-gray-200 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  </div>
                ) : isVideoUnavailable ? (
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Video not available</h2>
                        <p className="mt-2 text-sm text-gray-600">
                          This video isn’t available right now. It might have been removed or the link could be incorrect.
                        </p>
                      </div>
                      <Button asChild>
                        <Link href="/favourites">Go back to favourites</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-black rounded-lg overflow-hidden">
                    <VideoPlayer videoUrl={`${mappedVideo.videoUrl}`} subtitles={subtitles} />
                  </div>
                )
                }
                
                {/* Video Info */}
                {mappedVideo && <VideoInfo video={mappedVideo} />}
                
                {/* Mobile Tabs */}
                {documents.length > 0 && (
                  <div className="lg:hidden">
                    <Tabs defaultValue="documents" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                        <TabsTrigger value="comments">Comments</TabsTrigger>
                      </TabsList>
                      <TabsContent value="documents" className="mt-4">
                        <VideoDocuments documents={documents} />
                      </TabsContent>
                      <TabsContent value="comments" className="mt-4">
                        <VideoComments videoId={videoId} />
                      </TabsContent>
                    </Tabs>
                  </div>
                )}

                {/* Desktop Documents & Comments */}
                {documents.length > 0 && (
                  <div className="hidden lg:block">
                    <Tabs defaultValue="documents" className="w-full">
                      {/* <TabsList>
                        <TabsTrigger value="documents">Documents & Resources</TabsTrigger>
                        <TabsTrigger value="comments">Comments</TabsTrigger>
                      </TabsList> */}
                      <TabsContent value="documents" className="mt-6">
                        <VideoDocuments documents={documents} />
                      </TabsContent>
                      <TabsContent value="comments" className="mt-6">
                        <VideoComments videoId={videoId} />
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </div>
              
              {/* Desktop Sidebar */}
              {mappedVideo && Array.isArray(playlistData?.sessions) && playlistData.sessions.length > 0 && (
                <div className="hidden lg:block w-80">
                  <RelatedVideos playlistData={playlistData} />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function VideoPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <VideoViewContent />
    </Suspense>
  )
}
