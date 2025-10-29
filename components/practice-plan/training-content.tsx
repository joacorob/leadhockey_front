import { PracticePlanItem } from "@/lib/types/practice-plan"
import { Play, Tag } from "lucide-react"
import { VideoPlayer } from "@/components/video/video-player"
import { Badge } from "@/components/ui/badge"

interface TrainingContentProps {
  item: PracticePlanItem
  planTitle: string
}

export function TrainingContent({ item, planTitle }: TrainingContentProps) {
  const thumbnail = item.thumbnail_url || "/placeholder.svg"

  const isVideo = item.itemType === "VIDEO_SESSION"
  const isDrill = item.itemType === "DRILL"

  // Prepare subtitles for VideoPlayer
  const subtitles = (item as any).subtitles?.map((s: any) => ({
    url: s.url,
    label: s.label ?? s.language,
    language: s.language,
    format: s.url.endsWith(".srt") ? "srt" : "vtt",
  })) ?? []

  // Get description, filters, and tags from the item
  const description = (item as any).description
  const filters = (item as any).filters || []
  const tags = (item as any).tags || []

  // Format thumbnail URL for drills
  const drillThumbnailSrc = isDrill && thumbnail
    ? thumbnail.startsWith('http') ? thumbnail : `data:image/png;base64,${thumbnail}`
    : thumbnail

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Main canvas/thumbnail area */}
      <div className={`relative aspect-video ${isDrill ? 'bg-gray-50' : 'bg-gradient-to-br from-blue-900 to-blue-700'}`}>
        {isVideo ? (
          <VideoPlayer
            key={`video-${item.itemId}-${item.itemType}`} // Force re-render when video changes
            videoUrl={(item as any).videoProcessedUrl || (item as any).videoUrl || ""}
            poster={thumbnail}
            fluid
            subtitles={subtitles}
            contentId={String(item.itemId)}
            contentType={item.itemType as "VIDEO_SESSION" | "DRILL"}
            enableProgressTracking={true}
          />
        ) : isDrill ? (
          // Drill thumbnail - show as static image without play button
          <img
            src={drillThumbnailSrc}
            alt={item.title || "Drill"}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg"
            }}
          />
        ) : (
          // Other content types with play button overlay
          <>
            <img
              src={thumbnail}
              alt={item.title || "Training item"}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg"
              }}
            />
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-green-500 rounded-full p-6 shadow-2xl hover:bg-green-600 transition-colors cursor-pointer">
                <Play className="w-12 h-12 text-white fill-white" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Item details section */}
      <div className="p-6">
        {/* Header & meta */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3 leading-snug">
            {item.title || `Training Item ${item.itemId}`}
          </h1>

          <div className="flex items-center flex-wrap gap-6 text-sm text-gray-600">
            {/* Duration */}
            {(item as any).duration && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {(item as any).duration}m
              </span>
            )}
            {/* Level (hardcoded Advanced for now) */}
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m9-9H3" />
              </svg>
              Advanced
            </span>
            {/* Coach (placeholder) */}
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A4 4 0 018 16h8a4 4 0 012.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Xavier Santolaria
            </span>
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="prose max-w-none text-gray-800 mb-8">
            <p className="whitespace-pre-wrap">{description}</p>
          </div>
        )}

        {/* Filters and Tags */}
        {(filters.length > 0 || tags.length > 0) && (
          <div className="mb-8 space-y-4">
            {filters.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Filters</h3>
                <div className="flex flex-wrap gap-2">
                  {filters.map((filter: any, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {filter.name || filter}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: any, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag.name || tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Downloads */}
        {isVideo && (item as any).pdfs && (item as any).pdfs.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-extrabold text-gray-900 mb-4 uppercase tracking-wide">Download Instructions</h3>
            <div className="flex flex-wrap gap-3">
              {(item as any).pdfs.map((pdf: any) => {
                // Try to infer language code (NL/EN/FR) from name
                const match = pdf.name.match(/([A-Z]{2})[_.\s]/);
                const label = match ? match[1] : "PDF";
                return (
                  <a
                    key={pdf.id}
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-6 py-2 rounded-md shadow transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3m5 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {label}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

