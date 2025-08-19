// Mock API client with realistic network simulation
class ApiClient {
  private baseUrl = '/api'
  
  private async simulateNetworkDelay(): Promise<void> {
    const delay = Math.random() * 1000 + 500 // 500-1500ms
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  private simulateError(): boolean {
    return Math.random() < 0.05 // 5% error rate
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    await this.simulateNetworkDelay()
    
    if (this.simulateError()) {
      throw new Error('Network error occurred')
    }

    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    await this.simulateNetworkDelay()
    
    if (this.simulateError()) {
      throw new Error('Network error occurred')
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    await this.simulateNetworkDelay()
    
    if (this.simulateError()) {
      throw new Error('Network error occurred')
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  }

  async delete<T>(endpoint: string): Promise<T> {
    await this.simulateNetworkDelay()
    
    if (this.simulateError()) {
      throw new Error('Network error occurred')
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  }
}

export const apiClient = new ApiClient()
