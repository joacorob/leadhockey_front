export interface PracticePlanItem {
  id: number
  practicePlanId: number
  itemType: 'DRILL' | 'VIDEO_SESSION' | 'FAVOURITE'
  itemId: number
  position: number
  /** Optional HH:mm starting time for the item */
  startTime?: string | null
  // Populated from backend joins for convenience
  title?: string
  thumbnail_url?: string
}

export interface PracticePlan {
  id: number
  title: string
  description?: string | null
  thumbnailUrl?: string | null
  clubId?: number | null
  createdBy: number
  status: 'draft' | 'published' | 'deleted'
  createdAt: string
  updatedAt: string
  items: PracticePlanItem[]
}

export interface CreatePracticePlanPayload {
  title: string
  description?: string | null
  thumbnail?: string | null  // Base64 string or URL
  status?: 'draft' | 'published'
  items?: Partial<PracticePlanItem>[]
}

// Generic responses
export interface PaginatedPracticePlanResponse {
  items: PracticePlan[]
  page: number
  limit: number
  totalPages: number
  totalItems: number
}
