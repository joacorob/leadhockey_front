export default function WatchLoading() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-lead-blue h-screen flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="w-20 h-8 bg-white/20 rounded animate-pulse" />
        </div>
        <div className="flex-1 py-4 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-3">
              <div className="w-24 h-4 bg-white/20 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Skeleton */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div />
          <div className="flex items-center space-x-4">
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
            <div className="w-64 h-10 bg-gray-200 rounded animate-pulse" />
            <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        
        {/* Content Skeleton */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Title Skeleton */}
            <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-4" />
            
            {/* Filters Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
              <div className="w-48 h-10 bg-gray-200 rounded animate-pulse" />
            </div>
            
            {/* Results Count Skeleton */}
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-4" />
            
            {/* Video Grid Skeleton */}
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
        </main>
      </div>
    </div>
  )
}
