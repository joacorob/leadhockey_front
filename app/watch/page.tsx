"use client"

import { useState, useEffect, useMemo, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { VideoCard } from "@/components/ui/video-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { PaginationComponent } from "@/components/ui/pagination"
import { Search, Filter as FilterIcon, ChevronLeft } from "lucide-react"
import { useApi } from "@/lib/hooks/use-api"
import { Category, Filter as VideoFilter } from "@/lib/types/api"
import { WatchContent, mapContentItem } from "@/lib/types/watch"

interface ApiResponse<T> {
  success: boolean
  data: T
}

interface WatchApiResponse {
  success: boolean
  data: {
    items: any[]
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

const ITEMS_PER_PAGE = 20

function mapToContentType(type?: string) {
  switch (type) {
    case "DRILL":
    case "DRILLS":
    case "DRILL_SESSION":
      return "DRILL" as const
    case "PRACTICE_SESSION":
    case "TRAINING_SESSION":
      return "PRACTICE_SESSION" as const
    default:
      return "VIDEO" as const
  }
}

export default function WatchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryParam = searchParams.get("category") ?? searchParams.get("category_id")

  const [searchTerm, setSearchTerm] = useState("")
  const [displayItems, setDisplayItems] = useState<WatchContent[]>([])
  const [filters, setFilters] = useState<VideoFilter[]>([])
  const [activeFilters, setActiveFilters] = useState<Record<string, string | string[]>>({})
  const [filterOptionIds, setFilterOptionIds] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [categoryTrail, setCategoryTrail] = useState<Category[]>([]) // Breadcrumb trail
  const [page, setPage] = useState(1)

  const { data: categoriesResponse, loading: categoriesLoading } = useApi<ApiResponse<Category[]>>("/categories")

  const categories = useMemo<Category[]>(() => {
    const raw = (categoriesResponse as any)?.data?.data?.items ?? []
    if (!Array.isArray(raw)) return []
    return raw.map((category: any) => ({ ...category, id: String(category.id) }))
  }, [categoriesResponse])

  // Fetch subcategories for the selected category
  const subCategoriesParams = useMemo(() => {
    if (!selectedCategoryId) {
      return { __skip: true }
    }
    return { parentId: selectedCategoryId }
  }, [selectedCategoryId])

  const { data: subCategoriesResponse, loading: subCategoriesLoading } = useApi<ApiResponse<Category[]>>(
    "/categories",
    subCategoriesParams
  )

  const subCategories = useMemo<Category[]>(() => {
    const raw = (subCategoriesResponse as any)?.data?.data?.items ?? []
    if (!Array.isArray(raw)) return []
    return raw.map((category: any) => ({ ...category, id: String(category.id) }))
  }, [subCategoriesResponse])

  // Determine if current category is a leaf (has no children)
  const currentCategory = useMemo(() => {
    return [...categories, ...subCategories].find(c => String(c.id) === selectedCategoryId)
  }, [categories, subCategories, selectedCategoryId])

  const isLeafCategory = useMemo(() => {
    // If we're still loading subcategories, we don't know yet
    if (subCategoriesLoading) return false
    
    // If we have subcategories, it's not a leaf
    if (subCategories.length > 0) return false
    
    // If the category explicitly says hasChildren, it's not a leaf
    if (currentCategory?.hasChildren) return false
    
    // If we have a selected category and no subcategories loaded, it's a leaf
    return !!selectedCategoryId
  }, [selectedCategoryId, subCategories, subCategoriesLoading, currentCategory])

  // Categories to display: subcategories if available, otherwise main categories
  const displayCategories = useMemo<Category[]>(() => {
    if (subCategories.length > 0) {
      return subCategories
    }
    return categories
  }, [subCategories, categories])

  useEffect(() => {
    if (!categories.length) return

    if (categoryParam) {
      const match = categories.find((category) => String(category.id) === String(categoryParam))
      if (match) {
        const newId = String(match.id)
        setSelectedCategoryId((prev) => {
          if (prev === newId) return prev
          
          // Initialize trail with the category from URL
          setCategoryTrail([match])
          return newId
        })
        return
      }
    }

    // Default to first category if no param
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(String(categories[0].id))
    }
  }, [categories, categoryParam, selectedCategoryId])

  useEffect(() => {
    setActiveFilters({})
    setFilterOptionIds([])
    setFilters([])
    setSearchTerm("")
    setPage(1)
  }, [selectedCategoryId])

  const filtersParams = useMemo(() => {
    // Only fetch filters when we're at a leaf category
    if (!selectedCategoryId || !isLeafCategory) {
      return { __skip: true }
    }
    return { categoryId: selectedCategoryId }
  }, [selectedCategoryId, isLeafCategory])

  const { data: filtersResponse, loading: filtersLoading } = useApi<{ success: boolean; data: any }>("/filters", filtersParams)

  useEffect(() => {
    if (filtersResponse && (filtersResponse as any).success) {
      const data = (filtersResponse as any).data
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : []
      setFilters(list as VideoFilter[])
    }
  }, [filtersResponse])

  useEffect(() => {
    const optionIds: string[] = []

    Object.values(activeFilters).forEach((value) => {
      if (Array.isArray(value)) {
        value.forEach((id) => {
          if (id !== null && id !== undefined && id !== "") {
            optionIds.push(String(id))
          }
        })
      } else if (value !== null && value !== undefined && value !== "") {
        optionIds.push(String(value))
      }
    })

    const sorted = Array.from(new Set(optionIds)).sort()

    setFilterOptionIds((prev) => {
      if (prev.length === sorted.length && prev.every((id, index) => id === sorted[index])) {
        return prev
      }
      return sorted
    })
  }, [activeFilters])

  const watchParams = useMemo(() => {
    // Only fetch watch content when we're at a leaf category
    if (!selectedCategoryId || !isLeafCategory) {
      return { __skip: true }
    }

    const params: Record<string, any> = {
      categoryId: selectedCategoryId,
      page,
      limit: ITEMS_PER_PAGE,
    }

    if (filterOptionIds.length > 0) {
      params.filterOptionIds = filterOptionIds.join(",")
    }

    if (searchTerm) {
      params.search = searchTerm
    }

    return params
  }, [selectedCategoryId, isLeafCategory, page, filterOptionIds, searchTerm])

  const {
    data: watchResponse,
    loading: watchLoading,
    error: watchError,
    refetch: refetchWatch,
  } = useApi<WatchApiResponse>("/watch", watchParams)

  const watchData = useMemo(() => (watchResponse as any)?.data?.data ?? null, [watchResponse])

  const rawItems = useMemo(() => (Array.isArray(watchData?.items) ? watchData.items : []), [watchData])

  const mappedItems = useMemo(() => {
    if (!Array.isArray(rawItems)) return []
    return rawItems.map((item: any) => mapContentItem(item, mapToContentType(item?.type)))
  }, [rawItems])

  useEffect(() => {
    setDisplayItems(mappedItems)
  }, [mappedItems])

  const selectedFilterChips = useMemo(() => {
    const chips: Array<{ code: string; optionId: string; label: string }> = []

    filters.forEach((filter) => {
      const value = activeFilters[filter.code]
      if (!value) return

      const appendChip = (optionId: string) => {
        const option = filter.options.find((opt) => String(opt.id) === String(optionId))
        if (option) {
          chips.push({ code: filter.code, optionId: String(option.id), label: `${filter.label}: ${option.label}` })
        }
      }

      if (Array.isArray(value)) {
        value.forEach((optionId) => appendChip(String(optionId)))
      } else {
        appendChip(String(value))
      }
    })

    return chips
  }, [filters, activeFilters])

  const totalPages = watchData?.totalPages ?? 1
  const totalItems = watchData?.totalItems ?? mappedItems.length
  const hasNext = page < totalPages
  const hasPrev = page > 1
  const isContentLoading = watchLoading || !selectedCategoryId

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === selectedCategoryId) return
    
    // Update the URL
    router.push(`/watch?category=${categoryId}`)
    
    // Find the clicked category and add it to trail
    const clickedCategory = displayCategories.find(c => String(c.id) === categoryId)
    if (clickedCategory) {
      setCategoryTrail(prev => {
        // Check if this category is already in the trail (going back)
        const existingIndex = prev.findIndex(c => String(c.id) === categoryId)
        if (existingIndex >= 0) {
          // Going back - keep only up to this category
          return prev.slice(0, existingIndex + 1)
        }
        // Moving forward - add to trail
        return [...prev, clickedCategory]
      })
    }
    
    setSelectedCategoryId(categoryId)
  }

  const handleBreadcrumbClick = (categoryId: string | null) => {
    if (categoryId === null) {
      // Go back to root
      router.push('/watch')
      setSelectedCategoryId(null)
      setCategoryTrail([])
    } else {
      // Go back to specific category in trail
      router.push(`/watch?category=${categoryId}`)
      setSelectedCategoryId(categoryId)
      
      // Update trail to only include categories up to this point
      const index = categoryTrail.findIndex(c => String(c.id) === categoryId)
      if (index >= 0) {
        setCategoryTrail(categoryTrail.slice(0, index + 1))
      }
    }
  }

  const handleFilterChange = (code: string, optionId: string, checked?: boolean) => {
    const id = String(optionId)

    setActiveFilters((prev) => {
      const filterDef = filters.find((filter) => filter.code === code)
      if (!filterDef) return prev

      if (filterDef.ui_type === "checkbox") {
        const current = Array.isArray(prev[code]) ? [...prev[code]] : []
        const exists = current.includes(id)

        if (checked) {
          if (exists) return prev
          return { ...prev, [code]: [...current, id] }
        }

        if (!exists) return prev
        const next = current.filter((value) => value !== id)
        if (next.length === 0) {
          const { [code]: _removed, ...rest } = prev
          return rest
        }

        return { ...prev, [code]: next }
      }

      if (!id) {
        if (prev[code] === undefined) return prev
        const { [code]: _removed, ...rest } = prev
        return rest
      }

      if (prev[code] === id) return prev
      return { ...prev, [code]: id }
    })

    setPage(1)
  }

  const handleRemoveFilterChip = (code: string, optionId: string) => {
    const id = String(optionId)

    setActiveFilters((prev) => {
      const current = prev[code]
      if (!current) return prev

      if (Array.isArray(current)) {
        const next = current.filter((value) => value !== id)
        if (next.length === 0) {
          const { [code]: _removed, ...rest } = prev
          return rest
        }
        return { ...prev, [code]: next }
      }

      if (current !== id) return prev
      const { [code]: _removed, ...rest } = prev
      return rest
    })

    setPage(1)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setActiveFilters({})
    setFilterOptionIds([])
    setPage(1)
  }

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage === page) return
    setPage(newPage)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [page])

  const handleNextPage = () => {
    if (hasNext) {
      handlePageChange(page + 1)
    }
  }

  const handlePrevPage = () => {
    if (hasPrev) {
      handlePageChange(page - 1)
    }
  }

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
              <div className="mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">Watch Content</h1>
                    
                    {/* Back button - show when we have a trail */}
                    {categoryTrail.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (categoryTrail.length === 1) {
                            // Go back to root
                            handleBreadcrumbClick(null)
                          } else {
                            // Go back to previous category in trail
                            const prevCategory = categoryTrail[categoryTrail.length - 2]
                            handleBreadcrumbClick(String(prevCategory.id))
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </Button>
                    )}
                  </div>
                  
                  {/* Breadcrumb navigation */}
                  {categoryTrail.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <button
                        onClick={() => handleBreadcrumbClick(null)}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        All Categories
                      </button>
                      {categoryTrail.map((cat, idx) => (
                        <div key={cat.id} className="flex items-center gap-2">
                          <span className="text-gray-400">/</span>
                          {idx === categoryTrail.length - 1 ? (
                            <span className="text-gray-900 font-medium">{cat.name}</span>
                          ) : (
                            <button
                              onClick={() => handleBreadcrumbClick(String(cat.id))}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {cat.name}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Only show category grid when NOT at leaf category */}
                {!isLeafCategory && (
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Browse by Category</h2>
                    {categoriesLoading || subCategoriesLoading ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="h-24 sm:h-28 bg-gray-200 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {displayCategories.map((category) => {
                          const isActive = selectedCategoryId === String(category.id)
                          return (
                            <div
                              key={category.id}
                              onClick={() => handleCategoryClick(String(category.id))}
                              className={`group cursor-pointer rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                                isActive ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
                              }`}
                            >
                              <div className="relative">
                                <img
                                  src={category.imageSrc || category.image || "/placeholder.svg"}
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
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Only show search and filters when at leaf category */}
                {isLeafCategory && (
                  <>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search content, coaches, or tags..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowFilters((prev) => !prev)}
                        className="flex items-center justify-center w-10 h-10 border border-input rounded-md hover:bg-accent"
                      >
                        <FilterIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {showFilters && (
                      filtersLoading ? (
                        <p className="text-sm text-gray-500 mb-4">Loading filters...</p>
                      ) : filters.length > 0 ? (
                        <div className="flex flex-wrap gap-4 mb-4">
                          {filters.map((filter) => {
                            const options = [...filter.options].sort((a, b) => a.ordering - b.ordering)
                            return (
                              <div key={filter.id} className="flex flex-col w-48 shrink-0">
                                <label className="block text-sm font-medium mb-2">{filter.label}</label>
                                {filter.ui_type === "select" && (
                                  <Select
                                    value={(activeFilters[filter.code] as string) || "__all__"}
                                    onValueChange={(val) => handleFilterChange(filter.code, val === "__all__" ? "" : val)}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder={`Select ${filter.label}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="__all__">All</SelectItem>
                                      {options.map((opt) => (
                                        <SelectItem key={opt.id} value={String(opt.id)}>
                                          {opt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}

                                {filter.ui_type === "checkbox" && (
                                  <div className="flex flex-wrap gap-2">
                                    {options.map((opt) => {
                                      const optionId = String(opt.id)
                                      const checked = Array.isArray(activeFilters[filter.code])
                                        ? (activeFilters[filter.code] as string[]).includes(optionId)
                                        : false
                                      return (
                                        <label key={opt.id} className="flex items-center gap-1 text-sm">
                                          <Checkbox
                                            checked={checked}
                                            onCheckedChange={(checkedValue) =>
                                              handleFilterChange(filter.code, optionId, Boolean(checkedValue))
                                            }
                                          />
                                          {opt.label}
                                        </label>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : null
                    )}

                    {(searchTerm.trim().length > 0 || selectedFilterChips.length > 0) && (
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        {searchTerm.trim().length > 0 && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            Search: {searchTerm.trim()}
                            <button
                              onClick={() => setSearchTerm("")}
                              className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                            >
                              ×
                            </button>
                          </Badge>
                        )}
                        {selectedFilterChips.map((chip) => (
                          <Badge key={`${chip.code}-${chip.optionId}`} variant="secondary" className="flex items-center gap-1">
                            {chip.label}
                            <button
                              onClick={() => handleRemoveFilterChip(chip.code, chip.optionId)}
                              className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Only show content when at leaf category */}
              {isLeafCategory && (
                <>
                  {watchError && (
                    <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      <p className="mb-2">Failed to load watch content. {watchError}</p>
                      <Button variant="outline" size="sm" onClick={refetchWatch}>
                        Try again
                      </Button>
                    </div>
                  )}

                  {watchLoading ? (
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
                      <p className="text-sm text-gray-600 mb-4">
                        Showing {displayItems.length} item{displayItems.length !== 1 ? "s" : ""} (total {totalItems})
                      </p>

                      {displayItems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {displayItems.map((item) => (
                            <VideoCard key={`${item.contentType}-${item.id}`} video={item} showActions={false} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-500 mb-4">No content found matching your criteria</p>
                          <Button onClick={handleClearFilters}>Reset search & filters</Button>
                        </div>
                      )}

                      {totalPages > 1 && (
                        <div className="mt-8 flex justify-center">
                          <PaginationComponent
                            currentPage={page}
                            totalPages={totalPages}
                            hasNext={hasNext}
                            hasPrev={hasPrev}
                            onPageChange={handlePageChange}
                            onNext={handleNextPage}
                            onPrev={handlePrevPage}
                          />
                        </div>
                      )}
                    </>
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
