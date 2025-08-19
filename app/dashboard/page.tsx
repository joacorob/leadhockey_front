"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { ClubNews } from "@/components/sections/club-news"
import { VideoSection } from "@/components/sections/video-section"
import { continueWatchingVideos, clubSessions } from "@/data/videos"
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

            {/* Continue Watching */}
            <VideoSection title="CONTINUE WATCHING" videos={continueWatchingVideos} onVideoClick={handleVideoClick} />

            {/* My Club Sessions */}
            <VideoSection title="MY CLUB SESSIONS" videos={clubSessions} onVideoClick={handleVideoClick} />
          </div>
        </main>
      </div>
    </div>
  )
}
