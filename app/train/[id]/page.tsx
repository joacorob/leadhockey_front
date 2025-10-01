"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { PracticePlan } from "@/lib/types/practice-plan"
import { TrainingContent } from "@/components/practice-plan/training-content"
import { TrainingTimeline } from "@/components/practice-plan/training-timeline"
import { useToast } from "@/hooks/use-toast"

export default function TrainingSessionPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [plan, setPlan] = useState<PracticePlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeItemIndex, setActiveItemIndex] = useState(0)

  useEffect(() => {
    async function fetchPlan() {
      try {
        setLoading(true)
        const res = await fetch(`/api/practice-plans/${id}`)
        const response = await res.json()
        
        if (!res.ok) {
          throw new Error(response.error || response.message || "Failed to load training session")
        }

        // Backend might return { data: {...} } or just {...}
        const rawPlan = response.data || response
        // Map element fields into item for easier rendering
        const mappedItems = (rawPlan.items || []).map((it: any) => ({
          ...it,
          title: it.title || it.element?.title,
          thumbnail_url: it.thumbnail_url || it.element?.thumbnail,
          videoUrl: it.element?.videoUrl,
          videoProcessedUrl: it.element?.videoProcessedUrl,
          subtitles: it.element?.subtitles ?? [],
          pdfs: it.element?.pdfs ?? [],
        }))

        const planData = { ...rawPlan, items: mappedItems }
        setPlan(planData as any)
      } catch (e: any) {
        toast({
          title: "Error",
          description: e.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [id, toast])

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-gray-600">
              <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span>Loading training session...</span>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!plan || !plan.items || plan.items.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No training items found</h2>
              <p className="text-gray-600">This training session doesn't have any items yet.</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const currentItem = plan.items[activeItemIndex]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{plan.title}</h1>
              {plan.description && (
                <p className="text-gray-600">{plan.description}</p>
              )}
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - Main content (2/3) */}
              <div className="lg:col-span-2">
                <TrainingContent item={currentItem} planTitle={plan.title} />
              </div>

              {/* Right column - Timeline (1/3) */}
              <div className="lg:col-span-1">
                <TrainingTimeline
                  items={plan.items}
                  activeIndex={activeItemIndex}
                  onItemClick={setActiveItemIndex}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

