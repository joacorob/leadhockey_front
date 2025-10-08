import { useCallback, useRef } from "react"

interface ProgressData {
  positionSec: number
  durationSec: number
}

interface SaveProgressResponse {
  success: boolean
  data?: {
    progress: any
    completed: boolean
  }
  error?: string
}

/**
 * Hook para manejar el progreso de videos/drills
 * Centraliza la lógica de fetch y save del progreso
 */
export function useVideoProgress() {
  const savingRef = useRef(false)

  /**
   * Obtener progreso guardado
   */
  const getProgress = useCallback(
    async (contentId: string, contentType: "VIDEO_SESSION" | "DRILL") => {
      try {
        const endpoint =
          contentType === "VIDEO_SESSION"
            ? `/api/videos/${contentId}/progress`
            : `/api/drills/${contentId}/progress`

        const response = await fetch(endpoint)

        if (!response.ok) {
          if (response.status === 401) {
            // Token expirado, redirigir a login
            window.location.href = "/login"
            return null
          }
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        return data?.data?.progress || null
      } catch (error) {
        console.error("Failed to get progress:", error)
        return null
      }
    },
    []
  )

  /**
   * Guardar progreso
   */
  const saveProgress = useCallback(
    async (
      contentId: string,
      contentType: "VIDEO_SESSION" | "DRILL",
      positionSec: number,
      durationSec: number
    ): Promise<SaveProgressResponse> => {
      // Validar antes de enviar
      if (!shouldSaveProgress(positionSec, durationSec)) {
        return { success: false, error: "Invalid progress data" }
      }

      // Evitar múltiples requests simultáneos
      if (savingRef.current) {
        return { success: false, error: "Already saving" }
      }

      try {
        savingRef.current = true

        const endpoint =
          contentType === "VIDEO_SESSION"
            ? `/api/videos/${contentId}/progress`
            : `/api/drills/${contentId}/progress`

        const response = await fetch(endpoint, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            positionSec: Math.floor(positionSec),
            durationSec: Math.floor(durationSec),
          }),
        })

        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = "/login"
            return { success: false, error: "Unauthorized" }
          }
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()

        // Log cuando se completa
        if (data?.data?.completed) {
          console.log(`✅ Content ${contentId} marked as completed!`)
        }

        return {
          success: true,
          data: data?.data,
        }
      } catch (error) {
        console.error("Failed to save progress:", error)
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      } finally {
        savingRef.current = false
      }
    },
    []
  )

  return {
    getProgress,
    saveProgress,
  }
}

/**
 * Validar si el progreso es válido antes de enviarlo
 */
function shouldSaveProgress(position: number, duration: number): boolean {
  return (
    position >= 0 &&
    duration > 0 &&
    position <= duration &&
    !isNaN(position) &&
    !isNaN(duration)
  )
}

/**
 * Formatear segundos a MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

