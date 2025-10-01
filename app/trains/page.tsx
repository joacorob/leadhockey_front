"use client"

import { usePaginatedApi } from "@/lib/hooks/use-api"
import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus } from "lucide-react"
import { PaginationComponent } from "@/components/ui/pagination"
import { TrainingCard } from "@/components/practice-plan/training-card"
import Link from "next/link"

interface PracticePlan {
  id: number
  title: string
  description?: string | null
  clubId?: number | null
  createdBy: number
  status: string
  createdAt: string
  updatedAt: string
  items: Array<{
    id: number
    practicePlanId: number
    itemType: string
    itemId: number
    position: number
    startTime?: string | null
    element?: {
      thumbnail?: string
      duration?: number
      title?: string
    }
  }>
}

export default function TrainsPage() {
  const [search, setSearch] = useState("")
  const [selectedYear, setSelectedYear] = useState("2025")
  const [selectedWeek, setSelectedWeek] = useState("all")
  const [selectedGroup, setSelectedGroup] = useState("all")
  const [selectedTeam, setSelectedTeam] = useState("all")
  const [selectedTime, setSelectedTime] = useState("all")

  const {
    data: practicePlans,
    pagination,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage
  } = usePaginatedApi<PracticePlan>("/practice-plans", { limit: 20 })

  // Client-side filtering for search
  const filteredPlans = (practicePlans || []).filter((plan) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      plan.title.toLowerCase().includes(searchLower) ||
      plan.description?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header with title and create button */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">All Trainings</h1>
              <Link href="/create/train">
                <Button className="bg-green-500 hover:bg-green-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create training
                </Button>
              </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {/* Year */}
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>

              {/* Week */}
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="Week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All weeks</SelectItem>
                  <SelectItem value="week1">Week 1</SelectItem>
                  <SelectItem value="week2">Week 2</SelectItem>
                  <SelectItem value="week3">Week 3</SelectItem>
                  <SelectItem value="week4">Week 4</SelectItem>
                </SelectContent>
              </Select>

              {/* Groups */}
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="Groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All groups</SelectItem>
                  <SelectItem value="group1">Group A</SelectItem>
                  <SelectItem value="group2">Group B</SelectItem>
                  <SelectItem value="group3">Group C</SelectItem>
                </SelectContent>
              </Select>

              {/* Teams */}
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All teams</SelectItem>
                  <SelectItem value="team1">Team 1</SelectItem>
                  <SelectItem value="team2">Team 2</SelectItem>
                  <SelectItem value="team3">Team 3</SelectItem>
                </SelectContent>
              </Select>

              {/* Time */}
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search trainings..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="text-red-500 mb-4">
                {error}
              </div>
            )}

            {/* Loading state */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                    <div className="aspect-video bg-gray-200 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="w-1/2 h-3 bg-gray-200 rounded animate-pulse" />
                      <div className="w-1/3 h-3 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Training cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPlans.map((plan) => (
                    <TrainingCard key={plan.id} plan={plan} />
                  ))}
                </div>

                {/* Empty state */}
                {filteredPlans.length === 0 && !loading && (
                  <div className="text-center py-12">
                    {search ? (
                      <>
                        <p className="text-gray-500 mb-4">No trainings found matching "{search}"</p>
                        <Button 
                          onClick={() => setSearch("")}
                          variant="outline"
                        >
                          Clear search
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-500 mb-4">No trainings found</p>
                        <Link href="/create/train">
                          <Button className="bg-green-500 hover:bg-green-600 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Create your first training
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {!loading && pagination && pagination.totalPages > 1 && (
                  <div className="mt-8">
                    <PaginationComponent
                      currentPage={pagination.page || 1}
                      totalPages={pagination.totalPages || 1}
                      hasNext={pagination.hasNext || false}
                      hasPrev={pagination.hasPrev || false}
                      onPageChange={goToPage}
                      onNext={nextPage}
                      onPrev={prevPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

