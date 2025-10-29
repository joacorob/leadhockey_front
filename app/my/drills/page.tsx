"use client"

import { useState, useEffect, useMemo } from "react"
import { Suspense } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { VideoCard } from "@/components/ui/video-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, Filter as FilterIcon } from "lucide-react"
import Link from "next/link"
import { WatchContent, mapContentItem } from "@/lib/types/watch"
import { Filter as VideoFilter } from "@/lib/types/api"
import { useApi } from "@/lib/hooks/use-api"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ApiResponse {
  success: boolean
  data: {
    items: any[]
    page?: number
    totalPages?: number
  }
}

export default function MyDrillsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredDrills, setFilteredDrills] = useState<WatchContent[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDrillId, setSelectedDrillId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Filter state
  const [filters, setFilters] = useState<VideoFilter[]>([])
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [showFilters, setShowFilters] = useState(false)
  const [filterOptionIds, setFilterOptionIds] = useState<Array<number | string>>([])

  // Load filters for drill category
  const DEFAULT_DRILL_CATEGORY_ID = process.env.NEXT_PUBLIC_DEFAULT_DRILL_CATEGORY_ID || "2"
  const { data: filtersResponse, loading: filtersLoading } = useApi<{ success: boolean; data: any }>(
    "/filters",
    { categoryId: DEFAULT_DRILL_CATEGORY_ID },
  )

  // Build API params with filters
  const apiParams = useMemo(() => {
    const params: Record<string, any> = { refresh: refreshKey }
    if (searchTerm) params.search = searchTerm
    if (filterOptionIds.length > 0) params.filterOptionIds = filterOptionIds.join(',')
    return params
  }, [refreshKey, searchTerm, filterOptionIds])

  const { data: drillsResponse, loading: drillsLoading } = useApi<ApiResponse>(`/me/drills`, apiParams)
  const { toast } = useToast()

  const drills = useMemo(() => {
    // API returns nested structure: data.data.items
    const raw = (drillsResponse as any)?.data?.data?.items ?? []
    return Array.isArray(raw) ? raw.map((item: any) => mapContentItem(item, "DRILL")) : []
  }, [drillsResponse])

  // Process filters from backend
  useEffect(() => {
    if (filtersResponse && (filtersResponse as any).success) {
      const list = Array.isArray((filtersResponse as any).data?.data)
        ? (filtersResponse as any).data.data
        : Array.isArray((filtersResponse as any).data)
        ? (filtersResponse as any).data
        : []
      setFilters(list as VideoFilter[])
    }
  }, [filtersResponse])

  // Update filterOptionIds when activeFilters change
  useEffect(() => {
    const optionIds: Array<number | string> = []
    filters.forEach((f) => {
      const val = activeFilters[f.code]
      if (val === undefined || val === null || val === "") return
      if (f.ui_type === "checkbox") {
        if (Array.isArray(val)) {
          val.forEach((id) => optionIds.push(id))
        }
      } else if (f.ui_type === "select") {
        optionIds.push(val as any)
      }
      // Note: number inputs typically don't map to predefined option IDs
    })
    setFilterOptionIds(optionIds)
  }, [activeFilters, filters])

  useEffect(() => {
    // Since filters are now handled by the backend, just set the drills directly
    setFilteredDrills(drills)
  }, [drills])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleFilterChange = (code: string, value: any, checked?: boolean) => {
    setActiveFilters((prev) => {
      const current = prev[code]
      const filterDef = filters.find((f) => f.code === code)

      if (!filterDef) return prev

      if (filterDef.ui_type === "checkbox") {
        let arr = Array.isArray(current) ? [...current] : []
        if (checked) {
          arr.push(value)
        } else {
          arr = arr.filter((v: any) => v !== value)
        }
        return { ...prev, [code]: arr }
      } else {
        return { ...prev, [code]: value }
      }
    })
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    setSearchTerm("")
    setFilterOptionIds([])
  }

  const handleDeleteClick = (drillId: number) => {
    setSelectedDrillId(drillId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedDrillId || isDeleting) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/drills/${selectedDrillId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || "Failed to delete drill")
      }

      toast({
        title: "Success",
        description: "Drill deleted successfully. It has been removed from all practice plans.",
      })

      // Close dialog and reset state BEFORE refresh to avoid race conditions
      setDeleteDialogOpen(false)
      setSelectedDrillId(null)
      
      // Small delay to ensure dialog is fully closed before refresh
      setTimeout(() => {
        setRefreshKey((prev) => prev + 1)
      }, 100)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete drill",
        variant: "destructive",
      })
      // Don't close dialog on error so user can try again
    } finally {
      setIsDeleting(false)
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
                <h1 className="text-2xl font-bold text-gray-900 mb-6">My Drills</h1>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search your drills..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
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

                {/* Dynamic Filters from backend */}
                {showFilters && (filtersLoading ? (
                  <p className="text-sm text-gray-500 mb-4">Loading filters...</p>
                ) : Array.isArray(filters) && filters.length > 0 ? (
                  <div className="flex flex-wrap gap-4 mb-4">
                    {filters.map((filter) => (
                      <div key={filter.id} className="flex flex-col w-48 shrink-0">
                        <label className="block text-sm font-medium mb-2">{filter.label}</label>
                        {filter.ui_type === "select" && (
                          <Select
                            value={(activeFilters[filter.code] as string) || ""}
                            onValueChange={(val) => handleFilterChange(filter.code, val)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={`Select ${filter.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {filter.options.map((opt) => (
                                <SelectItem key={opt.id} value={String(opt.id)}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {filter.ui_type === "checkbox" && (
                          <div className="flex flex-wrap gap-2">
                            {filter.options.map((opt) => {
                              const checked = Array.isArray(activeFilters[filter.code]) && (activeFilters[filter.code] as any[]).includes(opt.value)
                              return (
                                <label key={opt.id} className="flex items-center gap-1 text-sm">
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(c) => handleFilterChange(filter.code, opt.value, c as boolean)}
                                  />
                                  {opt.label}
                                </label>
                              )
                            })}
                          </div>
                        )}

                        {filter.ui_type === "number" && (
                          <Input
                            type="number"
                            value={(activeFilters[filter.code] as number | string | undefined) ?? ""}
                            onChange={(e) => handleFilterChange(filter.code, Number(e.target.value))}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : null)}

                {/* Active filters */}
                {showFilters && (
                  <div className="flex items-center gap-2 mb-4">
                    {searchTerm && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Search: {searchTerm}
                        <button onClick={() => handleSearch("")} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
                          ×
                        </button>
                      </Badge>
                    )}
                    {Object.keys(activeFilters).length > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Filters applied
                        <button onClick={clearAllFilters} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
                          ×
                        </button>
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {drillsLoading ? (
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
              ) : !drillsResponse ? (
                /* Still loading initial data */
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
                    {filteredDrills.length} drill{filteredDrills.length !== 1 ? "s" : ""}
                  </p>

                  {/* Drills grid */}
                  {filteredDrills.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredDrills.map((drill) => (
                        <VideoCard 
                          key={drill.id} 
                          video={drill}
                          onDelete={handleDeleteClick}
                        />
                      ))}
                    </div>
                  ) : (
                    /* Empty state - only show when we're sure there are no drills */
                    <div className="text-center py-12">
                      <div className="mb-4">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="mt-2 text-sm font-semibold text-gray-900">No drills yet</h3>
                      <p className="mt-1 text-sm text-gray-500 mb-4">
                        {searchTerm
                          ? "No drills match your search."
                          : "Get started by creating your first drill."}
                      </p>
                      {!searchTerm && (
                        <Link href="/create/drill">
                          <Button>Create your first drill</Button>
                        </Link>
                      )}
                      {searchTerm && (
                        <Button onClick={() => handleSearch("")} variant="outline">
                          Clear search
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </Suspense>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteDialogOpen} 
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            // Only allow closing if not currently deleting
            setDeleteDialogOpen(false)
            setSelectedDrillId(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Drill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this drill? This will permanently remove it and it will be removed from all practice plans. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              onClick={(e) => {
                e.preventDefault()
                handleDeleteConfirm()
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

