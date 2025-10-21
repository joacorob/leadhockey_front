"use client"

import { useState, useEffect, useMemo } from "react"
import { Suspense } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { VideoCard } from "@/components/ui/video-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { WatchContent, mapContentItem } from "@/lib/types/watch"
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

  const { data: drillsResponse, loading: drillsLoading } = useApi<ApiResponse>(`/me/drills?refresh=${refreshKey}`)
  const { toast } = useToast()

  const drills = useMemo(() => {
    // API returns nested structure: data.data.items
    const raw = (drillsResponse as any)?.data?.data?.items ?? []
    return Array.isArray(raw) ? raw.map((item: any) => mapContentItem(item, "DRILL")) : []
  }, [drillsResponse])

  useEffect(() => {
    filterDrills(searchTerm)
  }, [drills, searchTerm])

  const filterDrills = (search: string) => {
    let filtered = drills

    if (search) {
      filtered = filtered.filter(
        (drill) =>
          drill.title.toLowerCase().includes(search.toLowerCase()) ||
          drill.description.toLowerCase().includes(search.toLowerCase()) ||
          drill.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase()))
      )
    }

    setFilteredDrills(filtered)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
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

      // Refresh the list
      setRefreshKey((prev) => prev + 1)
      setDeleteDialogOpen(false)
      setSelectedDrillId(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete drill",
        variant: "destructive",
      })
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

                {/* Search */}
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
                </div>
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
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Drill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this drill? This will permanently remove it and it will be removed from all practice plans. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

