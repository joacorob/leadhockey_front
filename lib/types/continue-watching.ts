// Response del backend para continue-watching
export interface ContinueWatchingItem {
  contentType: "VIDEO_SESSION" | "DRILL"
  contentId: number
  title: string
  thumbnail: string
  positionSec: number
  durationSec: number
  updatedAt: string
}

export interface ContinueWatchingResponse {
  success: boolean
  data: {
    items: ContinueWatchingItem[]
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

// Tipo extendido de Video para incluir progreso
export interface VideoWithProgress {
  id: string
  title: string
  duration: string
  thumbnail: string
  coach?: string
  category?: string
  tags?: string[]
  description?: string
  // Campos de progreso
  progressPercent?: number
  positionSec?: number
  durationSec?: number
  contentType?: "VIDEO_SESSION" | "DRILL"
}

/**
 * Mapea un item de continue-watching a formato Video
 */
export function mapContinueWatchingToVideo(item: ContinueWatchingItem): VideoWithProgress {
  const progressPercent = (item.positionSec / item.durationSec) * 100
  
  return {
    id: String(item.contentId),
    title: item.title,
    thumbnail: item.thumbnail || "/placeholder-logo.png",
    duration: formatDuration(item.durationSec),
    coach: "Lead Hockey", // Placeholder, el backend no retorna coach
    category: item.contentType === "VIDEO_SESSION" ? "Video" : "Drill",
    tags: [],
    description: "",
    progressPercent,
    positionSec: item.positionSec,
    durationSec: item.durationSec,
    contentType: item.contentType,
  }
}

/**
 * Formatea segundos a formato MM:SS
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

/**
 * Formatea segundos a formato legible "X min" o "XX:XX"
 */
export function formatTimeRemaining(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  if (mins === 0) {
    return `${seconds}s left`
  }
  if (seconds % 60 === 0) {
    return `${mins} min left`
  }
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")} left`
}

