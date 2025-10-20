"use client"

import { useState, useEffect, useMemo } from "react"
import { Suspense } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { TrainingCard } from "@/components/practice-plan/training-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"
import { useApi } from "@/lib/hooks/use-api"

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
  const [filteredTrainings, setFilteredTrainings] = useState<any[]>([])

  const { data: trainingsResponse, loading: trainingsLoading } = useApi<ApiResponse>("/me/practice-sessions")

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

  useEffect(() => {
    filterTrainings(searchTerm)
  }, [trainings, searchTerm])

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

                {/* Search */}
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
                </div>
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
                        <TrainingCard key={training.id} plan={training} />
                      ))}
                    </div>
                  ) : (
                    /* Empty state */
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
    </div>
  )
}

