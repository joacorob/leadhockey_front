// API Types and Interfaces
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'player' | 'coach' | 'admin'
  subscription: 'free' | 'pro' | 'elite'
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  user: User
  token: string
  expiresAt: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role: 'player' | 'coach'
  agreeToTerms: boolean
}

export interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: number
  views: number
  likes: number
  category: string
  coach: {
    id: string
    name: string
    avatar: string
  }
  tags: string[]
  createdAt: string
  videoUrl: string
  documents?: Document[]
}

export interface Document {
  id: string
  title: string
  type: 'pdf' | 'doc' | 'image'
  url: string
  size: number
}

export interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  createdAt: string
  replies?: Comment[]
  likes: number
}

export interface Session {
  id: string
  title: string
  description: string
  coach: {
    id: string
    name: string
    avatar: string
  }
  date: string
  duration: number
  participants: number
  maxParticipants: number
  status: 'upcoming' | 'live' | 'completed'
  category: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface VideoFilters {
  category?: string
  coach?: string
  search?: string
  sortBy?: 'newest' | 'popular' | 'duration'
  page?: number
  limit?: number
}

// Video dynamic filters
export interface FilterOption {
  id: number
  value: string | number
  label: string
  ordering: number
}

export interface Filter {
  id: number
  code: string
  label: string
  ui_type: "select" | "checkbox" | "number"
  options: FilterOption[]
}
