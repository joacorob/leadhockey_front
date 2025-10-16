export type ContentType = "VIDEO" | "DRILL" | "PRACTICE_SESSION"

export interface WatchContent {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  coach: string
  category_id: string
  category: string
  created_at: string
  tags: string[]
  contentType: ContentType
  views?: number
  likes?: number
}

/**
 * Maps raw API response to unified WatchContent format
 */
export function mapContentItem(raw: any, contentType: ContentType): WatchContent {
  return {
    id: String(raw.id),
    title: raw.title || "Untitled",
    description: raw.description || "",
    thumbnail: raw.thumbnail || raw.thumbnail_url || "/placeholder.svg",
    duration: formatDuration(raw.duration),
    coach: typeof raw.coach === "string" ? raw.coach : raw.coach?.name || "LEAD",
    category_id: String(raw.categoryId || raw.category_id || raw.category || ""),
    category: raw.category_name || raw.category || "Unknown",
    created_at: raw.created_at || raw.createdAt || raw.updatedAt || new Date().toISOString(),
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    contentType,
    views: raw.views || 0,
    likes: raw.likes || 0,
  }
}

/**
 * Format duration from seconds to MM:SS or use existing string
 */
function formatDuration(duration: any): string {
  if (!duration) return "--:--"
  if (typeof duration === "string") return duration
  if (typeof duration === "number") {
    const mins = Math.floor(duration / 60)
    const secs = duration % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return "--:--"
}

