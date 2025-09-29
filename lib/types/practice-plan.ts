export interface PracticePlanItem {
  id: number
  practicePlanId: number
  itemType: 'DRILL' | 'VIDEO_SESSION' | 'FAVOURITE'
  itemId: number
  position: number
  // Populated from backend joins for convenience
  title?: string
  thumbnail_url?: string
}

export interface PracticePlan {
  id: number
  title: string
  description?: string | null
  clubId?: number | null
  createdBy: number
  status: 'draft' | 'published' | 'deleted'
  createdAt: string
  updatedAt: string
  items: PracticePlanItem[]
}

// Generic responses
export interface PaginatedPracticePlanResponse {
  items: PracticePlan[]
  page: number
  limit: number
  totalPages: number
  totalItems: number
}
