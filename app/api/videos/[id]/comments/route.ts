import { NextRequest, NextResponse } from 'next/server'
import { Comment, PaginatedResponse } from '@/lib/types/api'

// Mock comments database
const mockComments: Record<string, Comment[]> = {
  '1': [
    {
      id: 'c1',
      userId: 'u1',
      userName: 'Alex Player',
      userAvatar: '/hockey-player-headshot.png',
      content: 'Great explanation of power play setups! This really helped me understand the positioning.',
      createdAt: '2024-01-16T14:30:00Z',
      likes: 12,
      replies: [
        {
          id: 'c1r1',
          userId: 'coach1',
          userName: 'Mike Johnson',
          userAvatar: '/hockey-coach-headshot.png',
          content: 'Thanks Alex! Practice these formations and you\'ll see improvement in your team play.',
          createdAt: '2024-01-16T15:45:00Z',
          likes: 5
        }
      ]
    },
    {
      id: 'c2',
      userId: 'u2',
      userName: 'Sarah Hockey',
      userAvatar: '/female-hockey-player-headshot.png',
      content: 'The umbrella formation section was particularly useful. Can you do a video on penalty kill strategies next?',
      createdAt: '2024-01-16T16:20:00Z',
      likes: 8
    },
    {
      id: 'c3',
      userId: 'u3',
      userName: 'Coach Tom',
      userAvatar: '/tech-director-headshot.png',
      content: 'I\'ve been coaching for 10 years and still learned something new from this video. Excellent work!',
      createdAt: '2024-01-17T09:15:00Z',
      likes: 15
    }
  ],
  '2': [
    {
      id: 'c4',
      userId: 'u4',
      userName: 'Defense Pro',
      userAvatar: '/young-hockey-player-headshot.png',
      content: 'The zone coverage tips are gold! My team\'s defensive play has improved significantly.',
      createdAt: '2024-01-15T11:30:00Z',
      likes: 9
    }
  ]
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Simulate database lookup delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const comments = mockComments[videoId] || []
    
    // Paginate comments
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedComments = comments.slice(startIndex, endIndex)

    const response: PaginatedResponse<Comment> = {
      data: paginatedComments,
      pagination: {
        page,
        limit,
        total: comments.length,
        totalPages: Math.ceil(comments.length / limit),
        hasNext: endIndex < comments.length,
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id
    const body = await request.json()
    const { content, userId, userName, userAvatar } = body
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newComment: Comment = {
      id: `c${Date.now()}`,
      userId,
      userName,
      userAvatar,
      content,
      createdAt: new Date().toISOString(),
      likes: 0
    }
    
    // Add comment to mock database
    if (!mockComments[videoId]) {
      mockComments[videoId] = []
    }
    mockComments[videoId].unshift(newComment)

    return NextResponse.json({
      success: true,
      data: newComment,
      message: 'Comment added successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
