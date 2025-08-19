import { NextRequest, NextResponse } from 'next/server'
import { Session, PaginatedResponse } from '@/lib/types/api'

// Mock sessions database
const mockSessions: Session[] = [
  {
    id: 's1',
    title: 'Advanced Skating Techniques',
    description: 'Join us for an intensive skating session focusing on edge work and acceleration.',
    coach: {
      id: 'coach1',
      name: 'Mike Johnson',
      avatar: '/hockey-coach-headshot.png'
    },
    date: '2024-02-15T18:00:00Z',
    duration: 90,
    participants: 12,
    maxParticipants: 20,
    status: 'upcoming',
    category: 'Skills'
  },
  {
    id: 's2',
    title: 'Power Play Workshop',
    description: 'Learn and practice power play formations with live feedback.',
    coach: {
      id: 'coach2',
      name: 'Sarah Williams',
      avatar: '/female-hockey-coach-headshot.png'
    },
    date: '2024-02-12T19:30:00Z',
    duration: 120,
    participants: 18,
    maxParticipants: 18,
    status: 'live',
    category: 'Strategy'
  },
  {
    id: 's3',
    title: 'Goalie Training Camp',
    description: 'Specialized training session for goalkeepers of all levels.',
    coach: {
      id: 'coach3',
      name: 'Tom Anderson',
      avatar: '/tech-director-headshot.png'
    },
    date: '2024-02-10T17:00:00Z',
    duration: 105,
    participants: 8,
    maxParticipants: 10,
    status: 'completed',
    category: 'Goaltending'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    
    // Filter sessions
    let filteredSessions = [...mockSessions]
    
    if (status) {
      filteredSessions = filteredSessions.filter(session => session.status === status)
    }
    
    if (category) {
      filteredSessions = filteredSessions.filter(session => 
        session.category.toLowerCase() === category.toLowerCase()
      )
    }
    
    // Sort by date
    filteredSessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // Paginate
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedSessions = filteredSessions.slice(startIndex, endIndex)

    const response: PaginatedResponse<Session> = {
      data: paginatedSessions,
      pagination: {
        page,
        limit,
        total: filteredSessions.length,
        totalPages: Math.ceil(filteredSessions.length / limit),
        hasNext: endIndex < filteredSessions.length,
        hasPrev: page > 1
      }
    }

    return NextResponse.json({
      success: true,
      ...response
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
