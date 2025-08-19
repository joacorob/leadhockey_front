"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { VideoCard } from "@/components/ui/video-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Heart, Search, Filter, Trash2 } from 'lucide-react'
import { Video } from "@/data/videos"

export default function FavouritesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Mock favourite videos data
  const favouriteVideos: Video[] = [
    {
      id: "fav-1",
      title: "Pull Back",
      duration: "01:04",
      thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PQij6hNhBewQsqnRBElPBKa2TRrHgC.png",
      coach: "Arthur Van Doren",
      category: "Ball Control",
      tags: ["eliminating", "basic"],
      description: "Master the pull back technique for better ball control",
      isEliminating: true
    },
    {
      id: "fav-2",
      title: "Jab Tackle",
      duration: "01:22",
      thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PQij6hNhBewQsqnRBElPBKa2TRrHgC.png",
      coach: "Arthur De Sloover",
      category: "Defense",
      tags: ["tackle", "defense", "jab"],
      description: "Effective jab tackle technique for defensive play"
    },
    {
      id: "fav-3",
      title: "Penalty Corner Drag Flick",
      duration: "01:26",
      thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PQij6hNhBewQsqnRBElPBKa2TRrHgC.png",
      coach: "Alexander Hendrickx",
      category: "Set Pieces",
      tags: ["penalty corner", "drag flick", "shooting"],
      description: "Perfect your penalty corner drag flick technique"
    }
  ]

  const [filteredVideos, setFilteredVideos] = useState(favouriteVideos)
  const categories = ["all", "Ball Control", "Defense", "Set Pieces", "Passing", "Shooting"]

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterVideos(term, selectedCategory)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    filterVideos(searchTerm, category)
  }

  const filterVideos = (search: string, category: string) => {
    let filtered = favouriteVideos

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
    console.log("Playing favourite video:", video.title)
  }

  const handleRemoveFromFavourites = (videoId: string) => {
    console.log("Removing from favourites:", videoId)
    // Handle remove from favourites logic
  }

  const clearAllFavourites = () => {
    console.log("Clearing all favourites")
    setFilteredVideos([])
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-6 h-6 text-red-500" />
                <h1 className="text-2xl font-bold text-gray-900">My Favourites</h1>
              </div>
              <p className="text-gray-600">Your saved training videos for quick access</p>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search your favourites..."
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

              {filteredVideos.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={clearAllFavourites}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </Button>
              )}
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

            {/* Results count */}
            <p className="text-sm text-gray-600 mb-4">
              {filteredVideos.length} favourite video{filteredVideos.length !== 1 ? 's' : ''}
            </p>

            {/* Video grid */}
            {filteredVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVideos.map((video) => (
                  <div key={video.id} className="relative group">
                    <VideoCard 
                      video={video} 
                      onClick={() => handleVideoClick(video)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFromFavourites(video.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                    >
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No favourites yet</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedCategory !== "all" 
                    ? "No videos found matching your criteria" 
                    : "Start adding videos to your favourites to see them here"
                  }
                </p>
                {(searchTerm || selectedCategory !== "all") && (
                  <Button onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                    setFilteredVideos(favouriteVideos)
                  }}>
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
