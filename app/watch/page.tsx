"use client"

import { useState, useEffect } from "react"
import { Suspense } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { VideoCard } from "@/components/ui/video-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useApi } from "@/lib/hooks/use-api"
import { Search, Filter } from "lucide-react"
import { useSearchParams } from "next/navigation"

interface Category {
  id: string
  name: string
  color: string
  icon: string
  description?: string
  image?: string
}

interface Video {
  id: string
  title: string
  description: string
  thumbnail_url: string
  video_url: string
  duration: string
  category_id: string
  category: string
  coach: string
  tags: string[]
  created_at: string
  updated_at: string
  views: number
  likes: number
  thumbnail: string
  isEliminating?: boolean
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

export default function WatchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([])

  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category") // id as string or null

  const { data: categoriesResponse, loading: categoriesLoading } = useApi<ApiResponse<Category[]>>("/categories")
  interface VideosApiResponse {
    items: any[]
    page: number
    totalPages: number
  }

  const { data: videosResponse, loading: videosLoading } = useApi<VideosApiResponse>("/videos")

  // Extract categories from the nested API response structure
  const categories = Array.isArray((categoriesResponse as any)?.data?.data?.items)
    ? ((categoriesResponse as any).data.data.items as Category[])
    : []

    const videos = Array.isArray((videosResponse as any)?.data?.data?.items)
    ? ((videosResponse as any).data.data.items as Video[])
    : []


  useEffect(() => {
    // When the URL query param changes, update the selected category accordingly
    if (!categories.length) return // wait until categories are loaded

    let categoryName = "all"
    if (categoryParam) {
      const matched = categories.find((c) => c.id.toString() === categoryParam)
      if (matched) {
        categoryName = matched.name
      }
    }

    setSelectedCategory((prev) => {
      if (prev === categoryName) return prev
      return categoryName
    })
    // Re-apply filtering whenever the param or videos list changes
    filterVideos(searchTerm, categoryName)
  }, [categoryParam, categories, videos])


  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterVideos(term, selectedCategory)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    filterVideos(searchTerm, category)
  }

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName)
    filterVideos(searchTerm, categoryName)
  }

  const filterVideos = (search: string, category: string) => {
    let filtered = videos

    if (search) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(search.toLowerCase()) ||
          video.coach.toLowerCase().includes(search.toLowerCase()) ||
          video.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase())),
      )
    }

    if (category !== "all") {
      const selectedCat = categories.find((cat) => cat.name === category)
      if (selectedCat) {
        filtered = filtered.filter((video) => video.category_id === selectedCat.id)
      }
    }

    // Map API video format to UI expected format
    const mappedVideos = filtered.map((video) => ({
      ...video,
      thumbnail: (video as any).thumbnail || (video as any).thumbnail_url || "/placeholder.svg",
      duration: typeof (video as any).duration === "number" ? formatDuration((video as any).duration) : (video as any).duration,
      video_url: (video as any).video_url || (video as any).videoUrl,
      category_id: (video as any).category_id || (video as any).category,
      category: categories.find((cat) => cat.id === ((video as any).category_id || (video as any).category))?.name ?? "Unknown",
      coach: typeof (video as any).coach === "string" ? (video as any).coach : (video as any).coach?.name ?? "Unknown",
    }))

    setFilteredVideos(mappedVideos as Video[])
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleVideoClick = (video: Video) => {
    console.log("Playing video:", video.title)
  }

  const categoryOptions = ["all", ...(categories || []).map((cat) => cat.name)]

  const categoryData = (categories || []).map((cat) => ({
    name: cat.name,
    image: cat.image || `/field-hockey-${cat.name.toLowerCase().replace(" ", "-")}.png`,
    description: cat.description || `Master ${cat.name.toLowerCase()} techniques`,
    color: cat.color,
    icon: cat.icon,
  }))

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <Suspense
            fallback={
              <div className="max-w-7xl mx-auto">
                <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
                  <div className="w-48 h-10 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                      <div className="aspect-video bg-gray-200 animate-pulse" />
                      <div className="p-4 space-y-2">
                        <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="w-1/2 h-3 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }
          >
            <div className="max-w-7xl mx-auto">
              {/* Page header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Watch Videos</h1>

                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Browse by Category</h2>
                  {categoriesLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-24 sm:h-28 bg-gray-200 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      {categoryData.map((category) => (
                        <div
                          key={category.name}
                          onClick={() => handleCategoryClick(category.name)}
                          className={`group cursor-pointer rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                            selectedCategory === category.name ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
                          }`}
                        >
                          <div className="relative">
                            <img
                              src={category.image || "/placeholder.svg"}
                              alt={category.name}
                              className="w-full h-24 sm:h-28 object-cover group-hover:brightness-110 transition-all duration-200"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                              <h3 className="text-white text-xs sm:text-sm font-semibold text-center leading-tight">
                                {category.name}
                              </h3>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
                      {categoryOptions.map((category) => (
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
                      <button
                        onClick={() => handleCategoryChange("all")}
                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                </div>
              </div>

              {videosLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                      <div className="aspect-video bg-gray-200 animate-pulse" />
                      <div className="p-4 space-y-2">
                        <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="w-1/2 h-3 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Results count */}
                  <p className="text-sm text-gray-600 mb-4">
                    Showing {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""}
                  </p>

                  {/* Video grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredVideos.map((video) => (
                      <VideoCard key={video.id} video={video} onClick={() => handleVideoClick(video)} />
                    ))}
                  </div>

                  {/* Empty state */}
                  {filteredVideos.length === 0 && !videosLoading && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">No videos found matching your criteria</p>
                      <Button
                        onClick={() => {
                          setSearchTerm("")
                          setSelectedCategory("all")
                          filterVideos("", "all")
                        }}
                      >
                        Clear filters
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Suspense>
        </main>
      </div>
    </div>
  )
}
