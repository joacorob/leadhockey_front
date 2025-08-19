import { NextRequest, NextResponse } from 'next/server'
import { Video, Document } from '@/lib/types/api'

const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Power Play Strategies',
    description: 'Learn advanced power play formations and tactics used by professional teams. This comprehensive guide covers everything from basic setups to complex plays that will give your team the edge during power play situations.',
    thumbnail: '/hockey-power-play.png',
    duration: 1245,
    views: 15420,
    likes: 892,
    category: 'Strategy',
    coach: {
      id: 'coach1',
      name: 'Mike Johnson',
      avatar: '/hockey-coach-headshot.png'
    },
    tags: ['power-play', 'strategy', 'advanced'],
    createdAt: '2024-01-15T10:00:00Z',
    videoUrl: 'https://example.com/video1.mp4',
    documents: [
      {
        id: 'doc1',
        title: 'Power Play Formations Guide',
        type: 'pdf',
        url: '/documents/power-play-guide.pdf',
        size: 2048000
      },
      {
        id: 'doc2',
        title: 'Practice Drills',
        type: 'doc',
        url: '/documents/power-play-drills.doc',
        size: 1024000
      }
    ]
  },
  // Add other videos with full details...
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id
    
    // Simulate database lookup delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const video = mockVideos.find(v => v.id === videoId)
    
    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      )
    }

    // Increment view count (in real app, this would update the database)
    video.views += 1

    return NextResponse.json({
      success: true,
      data: video
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id
    const body = await request.json()

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400))

    // Mock update (like/favorite toggle)
    const video = mockVideos.find(v => v.id === videoId)
    
    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      )
    }

    if (body.action === 'like') {
      video.likes = body.currentState ? video.likes - 1 : video.likes + 1
      video.isLiked = !body.currentState
      return NextResponse.json({
        success: true,
        data: { isLiked: video.isLiked, likes: video.likes }
      })
    }

    if (body.action === 'favorite') {
      video.isFavorited = !body.currentState
      return NextResponse.json({
        success: true,
        data: { isFavorited: video.isFavorited }
      })
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action'
    }, { status: 400 })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
