"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { ClubNews } from "@/components/sections/club-news"
import { VideoSection } from "@/components/sections/video-section"
import { ContinueWatchingSection } from "@/components/sections/continue-watching-section"
import { LatestVideosSection } from "@/components/sections/latest-videos-section"
import { clubSessions } from "@/data/videos"
import type { Video } from "@/data/videos"

export default function Dashboard() {
  const handleVideoClick = (video: Video) => {
    console.log("Playing video:", video.title)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            {/* Club News */}
            <ClubNews />

            {/* Continue Watching - Now with real data */}
            <ContinueWatchingSection />

            {/* My Club Sessions */}
            <VideoSection title="MY CLUB SESSIONS" videos={clubSessions} onVideoClick={handleVideoClick} />

            {/* Latest Videos - Playlist ID=4 */}
            <LatestVideosSection />
          </div>
        </main>
      </div>
    </div>
  )
}
