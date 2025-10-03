import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default function TrainsLoading() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-6">
              <div className="w-48 h-9 bg-gray-200 rounded animate-pulse" />
              <div className="w-40 h-10 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Filters skeleton */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-[140px] h-10 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>

            {/* Cards grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                  <div className="aspect-video bg-gray-200 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="w-1/2 h-3 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

