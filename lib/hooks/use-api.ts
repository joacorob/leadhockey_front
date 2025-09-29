import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { PaginatedResponse } from '@/lib/types/api'

// Basic API hook
export function useApi<T>(endpoint: string, params?: Record<string, any>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.get<T>(endpoint, params)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [endpoint, JSON.stringify(params)])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Paginated API hook
export function usePaginatedApi<T>(
  endpoint: string, 
  initialParams?: Record<string, any>
) {
  const [data, setData] = useState<T[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState(initialParams || {})

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.get<PaginatedResponse<T>>(endpoint, {
        ...params,
        page: pagination.page,
        limit: pagination.limit
      })
      console.log('Paginated API result', result)
      // Support multiple response shapes:
      const raw: any = result
      let items: T[] = []
      if (Array.isArray(raw.data)) items = raw.data
      else if (Array.isArray(raw.items)) items = raw.items
      else if (Array.isArray(raw.data?.items)) items = raw.data.items
      else if (Array.isArray(raw.data?.data?.items)) items = raw.data.data.items

      setData(items)

      // Extract pagination flexibly
      const p: any = raw.pagination ?? raw.data?.pagination ?? {}

      const page = p.page ?? raw.page ?? raw.data?.page ?? 1
      const totalPages = p.totalPages ?? raw.totalPages ?? raw.data?.totalPages ?? 1
      const limit = p.limit ?? raw.limit ?? raw.data?.limit ?? pagination.limit
      const total = p.total ?? raw.totalItems ?? raw.data?.totalItems ?? 0
      const hasNext = p.hasNext ?? raw.hasNext ?? raw.data?.hasNext ?? page < totalPages
      const hasPrev = p.hasPrev ?? raw.hasPrev ?? raw.data?.hasPrev ?? page > 1

      setPagination({
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [endpoint, JSON.stringify(params), pagination?.page, pagination?.limit])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateParams = useCallback((newParams: Record<string, any>) => {
    setParams(prev => ({ ...prev, ...newParams }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }, [])

  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }, [])

  const nextPage = useCallback(() => {
    if (pagination.hasNext) {
      goToPage(pagination.page + 1)
    }
  }, [pagination.hasNext, pagination.page, goToPage])

  const prevPage = useCallback(() => {
    if (pagination.hasPrev) {
      goToPage(pagination.page - 1)
    }
  }, [pagination.hasPrev, pagination.page, goToPage])

  return {
    data,
    pagination,
    loading,
    error,
    updateParams,
    goToPage,
    nextPage,
    prevPage,
    refetch: fetchData
  }
}

// Mutation hook for POST/PUT/DELETE operations
export function useMutation<TResponse, TRequest = any>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (
    endpoint: string, 
    data?: TRequest,
    method: 'POST' | 'PUT' | 'DELETE' = 'POST'
  ): Promise<TResponse | null> => {
    try {
      setLoading(true)
      setError(null)
      
      let result: TResponse
      switch (method) {
        case 'POST':
          result = await apiClient.post<TResponse>(endpoint, data)
          break
        case 'PUT':
          result = await apiClient.put<TResponse>(endpoint, data)
          break
        case 'DELETE':
          result = await apiClient.delete<TResponse>(endpoint)
          break
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { mutate, loading, error }
}
