"use client"

import { Suspense } from "react"
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

function VideoViewContent() {
  const params = useParams()
  const videoId = params.id as string

  // Fetch video data using useApi hook
  const { data: apiResponse, loading, error } = useApi(`/videos/${videoId}`)
  const videoData = (apiResponse as any)?.data ?? apiResponse

  // Map API response to UI shape expected by VideoInfo component
  const mappedVideo = videoData
    ? {
        id: videoData.id,
        title: videoData.title,
        description: videoData.description,
        videoUrl: videoData.videoUrl,
        duration: videoData.duration,
        views: videoData.views ?? 0,
        likes: videoData.likes ?? 0,
        uploadDate: videoData.createdAt ?? videoData.updatedAt ?? new Date().toISOString(),
        category: "Training", // Placeholder – you may map categoryId -> name
        tags: videoData.tags ?? [],
        owner: {
          name: "Uploader", // API does not provide owner details yet
          avatar: "/placeholder-user.jpg",
          bio: "",
          credentials: "",
        },
      }
    : null

  const isDataReady = !loading && !error && !!mappedVideo

  const documents = (videoData?.pdfs ?? []).map((pdf: any) => ({
    id: String(pdf.id),
    name: pdf.name,
    type: "PDF",
    size: pdf.size ? `${(pdf.size / (1024 * 1024)).toFixed(1)} MB` : "",
    description: "Training resource",
  }))

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
                ) : error || !mappedVideo ? (
                  <p className="text-center text-red-600">Failed to load video.</p>
                ) : (
                  <div className="bg-black rounded-lg overflow-hidden">
                    <VideoPlayer videoUrl={`/api/video-proxy?url=${encodeURIComponent(mappedVideo.videoUrl)}`} />
                  </div>
                )
                }
                
                {/* Video Info */}
                {mappedVideo && <VideoInfo video={mappedVideo} />}
                
                {/* Mobile Tabs */}
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

                {/* Desktop Documents & Comments */}
                <div className="hidden lg:block">
                  <Tabs defaultValue="documents" className="w-full">
                    <TabsList>
                      <TabsTrigger value="documents">Documents & Resources</TabsTrigger>
                      <TabsTrigger value="comments">Comments</TabsTrigger>
                    </TabsList>
                    <TabsContent value="documents" className="mt-6">
                      <VideoDocuments documents={documents} />
                    </TabsContent>
                    <TabsContent value="comments" className="mt-6">
                      <VideoComments videoId={videoId} />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
              
              {/* Desktop Sidebar */}
              <div className="hidden lg:block w-80">
                <RelatedVideos currentVideoId={videoId} />
              </div>
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
