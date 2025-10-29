"use client"

import { useState, useEffect, useMemo } from "react"
import { Suspense } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { TrainingCard } from "@/components/practice-plan/training-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Filter as FilterIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
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
import { useRouter } from "next/navigation"
import { Filter as VideoFilter } from "@/lib/types/api"

interface PracticePlanSummary {
  practicePlanId: number
  title: string
  description: string | null
  thumbnailUrl: string | null
  status: string
  itemsCount: number
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  success: boolean
  data: {
    success: boolean
    data: {
      items: PracticePlanSummary[]
      page: number
      limit: number
      totalItems: number
      totalPages: number
    }
  }
}

export default function MyTrainingsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [filteredTrainings, setFilteredTrainings] = useState<any[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCloning, setIsCloning] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Filter state
  const [filters, setFilters] = useState<VideoFilter[]>([])
  const [activeFilters, setActiveFilters] = useState<Record<string, string | string[]>>({})
  const [filterOptionIds, setFilterOptionIds] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Load filters for drill category
  const DEFAULT_DRILL_CATEGORY_ID = process.env.NEXT_PUBLIC_DEFAULT_DRILL_CATEGORY_ID || "2"
  const { data: filtersResponse, loading: filtersLoading } = useApi<{ success: boolean; data: any }>(
    "/filters",
    { categoryId: DEFAULT_DRILL_CATEGORY_ID },
  )

  // Build API params with filters
  const apiParams = useMemo(() => {
    const params: Record<string, any> = { refresh: refreshKey, status: statusFilter }
    if (filterOptionIds.length > 0) {
      params.filterOptionIds = filterOptionIds.join(',')
    }
    return params
  }, [refreshKey, statusFilter, filterOptionIds])

  const { data: trainingsResponse, loading: trainingsLoading } = useApi<ApiResponse>(`/me/practice-sessions`, apiParams)
  const { toast } = useToast()
  const router = useRouter()

  const trainings = useMemo(() => {
    // API response is double-nested: response.data.data.items
    const items = trainingsResponse?.data?.data?.items ?? []
    
    if (!Array.isArray(items)) return []
    
    // Map to format expected by TrainingCard
    return items.map((plan: PracticePlanSummary) => ({
      id: plan.practicePlanId,
      title: plan.title,
      description: plan.description,
      thumbnailUrl: plan.thumbnailUrl,
      status: plan.status,
      createdBy: 0, // Not provided in summary
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      items: [] // Empty array, we only have itemsCount
    }))
  }, [trainingsResponse])

  // Process filters from backend
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

  // Update filterOptionIds when activeFilters change
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

  useEffect(() => {
    filterTrainings(searchTerm)
  }, [trainings, searchTerm, statusFilter])

  const filterTrainings = (search: string) => {
    let filtered = trainings

    if (search) {
      filtered = filtered.filter(
        (training) =>
          training.title.toLowerCase().includes(search.toLowerCase()) ||
          (training.description && training.description.toLowerCase().includes(search.toLowerCase()))
      )
    }

    setFilteredTrainings(filtered)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
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
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setActiveFilters({})
    setFilterOptionIds([])
  }

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

  const handleClone = async (planId: number) => {
    if (isCloning) return

    setIsCloning(true)
    try {
      const response = await fetch(`/api/practice-plans/${planId}/clone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || "Failed to clone training plan")
      }

      const result = await response.json()

      toast({
        title: "Success",
        description: "Training plan cloned successfully!",
      })

      // Refresh the list
      setRefreshKey((prev) => prev + 1)

      // Navigate to the new plan
      if (result.data?.id) {
        router.push(`/train/${result.data.id}`)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clone training plan",
        variant: "destructive",
      })
    } finally {
      setIsCloning(false)
    }
  }

  const handleDeleteClick = (planId: number) => {
    setSelectedPlanId(planId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedPlanId || isDeleting) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/practice-plans/${selectedPlanId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || "Failed to delete training plan")
      }

      toast({
        title: "Success",
        description: "Training plan deleted successfully.",
      })

      // Close dialog and reset state BEFORE refresh to avoid race conditions
      setDeleteDialogOpen(false)
      setSelectedPlanId(null)
      
      // Small delay to ensure dialog is fully closed before refresh
      setTimeout(() => {
        setRefreshKey((prev) => prev + 1)
      }, 100)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete training plan",
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
                <h1 className="text-2xl font-bold text-gray-900 mb-6">My Trainings</h1>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search your trainings..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="deleted">Deleted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFilters((prev) => !prev)}
                    className="flex items-center justify-center w-10 h-10 border border-input rounded-md hover:bg-accent"
                  >
                    <FilterIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Dynamic Filters */}
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

                {/* Active filter chips */}
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
              </div>

              {trainingsLoading ? (
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
              ) : !trainingsResponse ? (
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
                    {filteredTrainings.length} training{filteredTrainings.length !== 1 ? "s" : ""}
                  </p>

                  {/* Trainings grid */}
                  {filteredTrainings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredTrainings.map((training) => (
                        <TrainingCard 
                          key={training.id} 
                          plan={training}
                          onClone={handleClone}
                          onDelete={handleDeleteClick}
                        />
                      ))}
                    </div>
                  ) : (
                    /* Empty state - only show when we're sure there are no trainings */
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
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                      </div>
                      <h3 className="mt-2 text-sm font-semibold text-gray-900">No trainings yet</h3>
                      <p className="mt-1 text-sm text-gray-500 mb-4">
                        {searchTerm
                          ? "No trainings match your search."
                          : "Get started by creating your first training session."}
                      </p>
                      {!searchTerm && (
                        <Link href="/create/train">
                          <Button>Create your first training</Button>
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
            setSelectedPlanId(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Training Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this training plan? This action cannot be undone.
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

