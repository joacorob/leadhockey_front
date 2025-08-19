import { NextRequest, NextResponse } from 'next/server'
import { LoginRequest, LoginResponse, User } from '@/lib/types/api'

// Mock users database
const mockUsers: User[] = [
  {
    id: '1',
    email: 'player@example.com',
    name: 'John Player',
    avatar: '/hockey-player-headshot.png',
    role: 'player',
    subscription: 'pro',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    email: 'coach@example.com',
    name: 'Sarah Coach',
    avatar: '/female-hockey-coach-headshot.png',
    role: 'coach',
    subscription: 'elite',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '3',
    email: 'admin@example.com',
    name: 'Mike Admin',
    avatar: '/tech-director-headshot.png',
    role: 'admin',
    subscription: 'elite',
    createdAt: '2024-01-01T10:00:00Z'
  }
]

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { email, password, rememberMe } = body

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock validation - accept any email with password "password123"
    if (password !== 'password123') {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Find user by email or create a mock user
    let user = mockUsers.find(u => u.email === email)
    if (!user) {
      user = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        role: 'player',
        subscription: 'free',
        createdAt: new Date().toISOString()
      }
    }

    // Generate mock token
    const token = `mock_token_${user.id}_${Date.now()}`
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000).toISOString()

    const response: LoginResponse = {
      user,
      token,
      expiresAt
    }

    return NextResponse.json({
      success: true,
      data: response,
      message: 'Login successful'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
