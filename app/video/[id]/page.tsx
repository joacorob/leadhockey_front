"use client"

import { Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { VideoPlayer } from "@/components/video/video-player"
import { VideoInfo } from "@/components/video/video-info"
import { VideoDocuments } from "@/components/video/video-documents"
import { VideoComments } from "@/components/video/video-comments"
import { RelatedVideos } from "@/components/video/related-videos"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function VideoViewContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const videoId = params.id as string

  // Mock video data - in real app this would come from API
  const videoData = {
    id: videoId,
    title: "Advanced Stick Handling Techniques",
    description: "Master the art of stick handling with these professional techniques used by elite players. This comprehensive training session covers advanced moves, body positioning, and game-situation applications that will elevate your puck control to the next level.",
    videoUrl: "https://leadhockey.ams3.digitaloceanspaces.com/sessions/videos/1751913879336-Skills%2018.mp4",
    duration: "12:45",
    views: 2847,
    likes: 156,
    uploadDate: "2 days ago",
    category: "Skills Training",
    tags: ["stick handling", "technique", "advanced", "puck control"],
    owner: {
      name: "Coach Sarah Williams",
      avatar: "/female-hockey-coach-headshot.png",
      bio: "Former Olympic gold medalist with 15+ years of coaching experience",
      credentials: "Level 4 Certified Coach, Olympic Champion 2018",
      totalVideos: 127,
      followers: 15420
    }
  }

  const documents = [
    {
      id: "1",
      name: "Stick Handling Drill Guide",
      type: "PDF",
      size: "2.4 MB",
      description: "Complete guide with 15 progressive stick handling drills"
    },
    {
      id: "2", 
      name: "Training Schedule Template",
      type: "PDF",
      size: "1.1 MB",
      description: "Weekly training schedule for skill development"
    },
    {
      id: "3",
      name: "Equipment Checklist",
      type: "PDF", 
      size: "0.8 MB",
      description: "Essential equipment for stick handling practice"
    }
  ]

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
                <div className="bg-black rounded-lg overflow-hidden">
                  <VideoPlayer videoUrl={videoData.videoUrl} />
                </div>
                
                {/* Video Info */}
                <VideoInfo video={videoData} />
                
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
