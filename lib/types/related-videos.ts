export type RelatedContentType = "VIDEO_SESSION" | "DRILL"

export interface RelatedVideoItem {
  id: string
  type: RelatedContentType
  title: string
  thumbnail: string
  duration: string
  coach?: string
}

const VALID_TYPES: RelatedContentType[] = ["VIDEO_SESSION", "DRILL"]

const DEFAULT_THUMBNAIL = "/placeholder.svg?height=80&width=128"

export function mapRelatedItem(raw: any, currentId?: string | number): RelatedVideoItem | null {
  if (!raw) return null

  const id = raw.id ?? raw.sessionId ?? raw.videoId
  if (!id) return null

  const idAsString = String(id)
  if (currentId && idAsString === String(currentId)) {
    return null
  }

  const type = VALID_TYPES.includes(raw.type) ? raw.type : "VIDEO_SESSION"

  return {
    id: idAsString,
    type,
    title: raw.title || "Untitled",
    thumbnail: raw.thumbnail || raw.thumbnailUrl || DEFAULT_THUMBNAIL,
    duration: normalizeDuration(raw.duration),
    coach: typeof raw.coach === "string" ? raw.coach : raw.coach?.name,
  }
}

function normalizeDuration(duration: unknown): string {
  if (typeof duration === "string" && duration.trim().length > 0) {
    return duration
  }

  if (typeof duration === "number" && duration > 0) {
    const mins = Math.floor(duration / 60)
    const secs = Math.floor(duration % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return "--:--"
}


