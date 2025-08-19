"use client"

import { useState } from "react"
import { SearchInput } from "@/components/ui/search-input"
import { FilterSelect } from "@/components/ui/filter-select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext
} from "@/components/ui/pagination"
import { VideoCardSkeleton } from "@/components/ui/loading-skeleton"
import { ExploreVideoCard } from "@/components/ui/explore-video-card"
import { usePaginatedApi } from "@/lib/hooks/use-api"
import { Video } from "@/lib/types/api"

const categoryOptions = [
  { value: 'strategy', label: 'Strategy' },
  { value: 'skills', label: 'Skills' },
  { value: 'defense', label: 'Defense' },
  { value: 'goaltending', label: 'Goaltending' },
  { value: 'youth', label: 'Youth' },
  { value: 'elite', label: 'Elite' }
]

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'duration', label: 'Duration' }
]

export default function ExplorePage() {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sortBy: 'newest'
  })

  const {
    data: videos,
    pagination,
    loading,
    error,
    updateParams,
    goToPage,
    nextPage,
    prevPage
  } = usePaginatedApi<Video>('/videos', filters)

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }))
    updateParams({ search })
  }

  const handleCategoryChange = (category: string) => {
    setFilters(prev => ({ ...prev, category }))
    updateParams({ category })
  }

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy }))
    updateParams({ sortBy })
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">Error loading videos: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Videos</h1>
        <p className="text-gray-600">Discover training videos and techniques from professional coaches</p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <SearchInput
          placeholder="Search videos..."
          onSearch={handleSearch}
          className="flex-1"
        />
        <FilterSelect
          placeholder="Category"
          options={categoryOptions}
          value={filters.category}
          onValueChange={handleCategoryChange}
          className="w-full sm:w-48"
        />
        <FilterSelect
          placeholder="Sort by"
          options={sortOptions}
          value={filters.sortBy}
          onValueChange={handleSortChange}
          className="w-full sm:w-48"
        />
      </div>

      {/* Results Info */}
      {!loading && (
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {videos.length} of {pagination.total} videos
            {filters.search && ` for "${filters.search}"`}
            {filters.category && ` in ${categoryOptions.find(c => c.value === filters.category)?.label}`}
          </p>
        </div>
      )}

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {loading ? (
          Array.from({ length: 12 }).map((_, index) => (
            <VideoCardSkeleton key={index} />
          ))
        ) : (
          videos.map((video) => (
            <ExploreVideoCard key={video.id} video={video} />
          ))
        )}
      </div>

      {/* No Results */}
      {!loading && videos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No videos found</p>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && videos.length > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          onPageChange={goToPage}
          onNext={nextPage}
          onPrev={prevPage}
        />
      )}
    </div>
  )
}
