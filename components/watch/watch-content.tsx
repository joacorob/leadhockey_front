"use client"

import { useState } from "react"
import { VideoCard } from "@/components/ui/video-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { allVideos, Video } from "@/data/videos"
import { Search, Filter } from 'lucide-react'

export function WatchContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [filteredVideos, setFilteredVideos] = useState(allVideos)

  const categories = ["all", "Ball Control", "Passing", "Defense", "Movement", "Team Training", "Set Pieces"]

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterVideos(term, selectedCategory)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    filterVideos(searchTerm, category)
  }

  const filterVideos = (search: string, category: string) => {
    let filtered = allVideos

    if (search) {
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(search.toLowerCase()) ||
        video.coach.toLowerCase().includes(search.toLowerCase()) ||
        video.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      )
    }

    if (category !== "all") {
      filtered = filtered.filter(video => video.category === category)
    }

    setFilteredVideos(filtered)
  }

  const handleVideoClick = (video: Video) => {
    console.log("Playing video:", video.title)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Watch Videos</h1>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search videos, coaches, or tags..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active filters */}
        <div className="flex items-center gap-2 mb-4">
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {searchTerm}
              <button onClick={() => handleSearch("")} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
                ×
              </button>
            </Badge>
          )}
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {selectedCategory}
              <button onClick={() => handleCategoryChange("all")} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
                ×
              </button>
            </Badge>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-600 mb-4">
        Showing {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
      </p>

      {/* Video grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVideos.map((video) => (
          <VideoCard 
            key={video.id}
            video={video} 
            onClick={() => handleVideoClick(video)}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No videos found matching your criteria</p>
          <Button onClick={() => {
            setSearchTerm("")
            setSelectedCategory("all")
            setFilteredVideos(allVideos)
          }}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}
