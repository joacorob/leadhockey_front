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
  club_id?: string | null
  rawType?: string
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
    coach: resolveCoach(raw),
    category_id: String(raw.categoryId || raw.category_id || raw.category || ""),
    category: raw.category_name || raw.category || "Unknown",
    created_at: raw.created_at || raw.createdAt || raw.updatedAt || new Date().toISOString(),
    tags: normalizeTags(raw),
    contentType,
    views: raw.views || 0,
    likes: raw.likes || 0,
    club_id: raw.clubId ?? raw.club_id ?? null,
    rawType: raw.type || raw.contentType || undefined,
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

function resolveCoach(raw: any): string {
  const coach = raw.coach || raw.owner || raw.author
  if (!coach) return "LEAD"

  if (typeof coach === "string") {
    return coach
  }

  if (typeof coach === "object" && coach !== null) {
    return coach.name || coach.fullName || coach.displayName || "LEAD"
  }

  return "LEAD"
}

function normalizeTags(raw: any): string[] {
  if (Array.isArray(raw.tags)) {
    return raw.tags.filter((tag) => typeof tag === "string" && tag.trim().length > 0).map((tag) => tag.trim())
  }

  if (Array.isArray(raw.tagList)) {
    return raw.tagList.filter((tag) => typeof tag === "string" && tag.trim().length > 0).map((tag) => tag.trim())
  }

  if (typeof raw.tags === "string") {
    return raw.tags
      .split(",")
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0)
  }

  return []
}

