"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { VideoPlayer } from "@/components/video/video-player"
import { VideoInfo } from "@/components/video/video-info"
import { VideoDocuments } from "@/components/video/video-documents"
import { VideoComments } from "@/components/video/video-comments"
import { RelatedVideos } from "@/components/video/related-videos"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import type { Video } from "@/data/videos"

interface VideoViewContentProps {
  videoId: string
  mappedVideo: {
    id: string
    title: string
    description: string
    videoUrl: string
    duration?: string
    views?: number
    likes?: number
    uploadDate: string
    category: string
    tags: string[]
    owner: {
      name: string
      avatar: string
      bio: string
      credentials: string
    }
  } | null
  documents: Array<{
    id: string
    name: string
    type: string
    size: string
    description: string
    url: string
  }>
  subtitles: Array<{
    url: string
    label: string
    language: string
    format?: "vtt" | "srt"
  }>
  relatedVideos: Video[]
}

export function VideoViewContent({
  videoId,
  mappedVideo,
  documents,
  subtitles,
  relatedVideos,
}: VideoViewContentProps) {
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
                {mappedVideo ? (
                  <div className="bg-black rounded-lg overflow-hidden">
                    <VideoPlayer 
                      videoUrl={`${mappedVideo.videoUrl}`} 
                      subtitles={subtitles}
                      contentId={videoId}
                      contentType="VIDEO_SESSION"
                      enableProgressTracking={true}
                    />
                  </div>
                ) : (
                  <p className="text-center text-red-600">Failed to load video.</p>
                )}

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
                <RelatedVideos currentVideoId={videoId} videos={relatedVideos} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
