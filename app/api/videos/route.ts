import { NextRequest, NextResponse } from 'next/server'
import { Video, PaginatedResponse, VideoFilters } from '@/lib/types/api'

// Mock videos database
const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Power Play Strategies',
    description: 'Learn advanced power play formations and tactics used by professional teams.',
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
    videoUrl: 'https://example.com/video1.mp4'
  },
  {
    id: '2',
    title: 'Defensive Zone Coverage',
    description: 'Master defensive positioning and zone coverage techniques.',
    thumbnail: '/hockey-defense.png',
    duration: 980,
    views: 12350,
    likes: 654,
    category: 'Defense',
    coach: {
      id: 'coach2',
      name: 'Sarah Williams',
      avatar: '/female-hockey-coach-headshot.png'
    },
    tags: ['defense', 'positioning', 'fundamentals'],
    createdAt: '2024-01-14T10:00:00Z',
    videoUrl: 'https://example.com/video2.mp4'
  },
  {
    id: '3',
    title: 'Goalie Fundamentals',
    description: 'Essential goaltending techniques for beginners and intermediate players.',
    thumbnail: '/hockey-goalie.png',
    duration: 1560,
    views: 8920,
    likes: 445,
    category: 'Goaltending',
    coach: {
      id: 'coach3',
      name: 'Tom Anderson',
      avatar: '/tech-director-headshot.png'
    },
    tags: ['goalie', 'fundamentals', 'technique'],
    createdAt: '2024-01-13T10:00:00Z',
    videoUrl: 'https://example.com/video3.mp4'
  },
  {
    id: '4',
    title: 'Skating Drills for Speed',
    description: 'Improve your skating speed with these professional training drills.',
    thumbnail: '/hockey-training.png',
    duration: 720,
    views: 18750,
    likes: 1205,
    category: 'Skills',
    coach: {
      id: 'coach1',
      name: 'Mike Johnson',
      avatar: '/hockey-coach-headshot.png'
    },
    tags: ['skating', 'speed', 'drills'],
    createdAt: '2024-01-12T10:00:00Z',
    videoUrl: 'https://example.com/video4.mp4'
  },
  {
    id: '5',
    title: 'Stick Handling Mastery',
    description: 'Advanced stick handling techniques to improve puck control.',
    thumbnail: '/hockey-player-training.png',
    duration: 1120,
    views: 14200,
    likes: 780,
    category: 'Skills',
    coach: {
      id: 'coach2',
      name: 'Sarah Williams',
      avatar: '/female-hockey-coach-headshot.png'
    },
    tags: ['stickhandling', 'puck-control', 'advanced'],
    createdAt: '2024-01-11T10:00:00Z',
    videoUrl: 'https://example.com/video5.mp4'
  },
  {
    id: '6',
    title: 'Team Communication',
    description: 'Learn effective on-ice communication strategies.',
    thumbnail: '/hockey-team-training.png',
    duration: 890,
    views: 9650,
    likes: 523,
    category: 'Strategy',
    coach: {
      id: 'coach3',
      name: 'Tom Anderson',
      avatar: '/tech-director-headshot.png'
    },
    tags: ['communication', 'teamwork', 'strategy'],
    createdAt: '2024-01-10T10:00:00Z',
    videoUrl: 'https://example.com/video6.mp4'
  },
  {
    id: '7',
    title: 'Youth Hockey Basics',
    description: 'Fundamental skills and techniques for young hockey players.',
    thumbnail: '/youth-hockey-training.png',
    duration: 1340,
    views: 22100,
    likes: 1456,
    category: 'Youth',
    coach: {
      id: 'coach1',
      name: 'Mike Johnson',
      avatar: '/hockey-coach-headshot.png'
    },
    tags: ['youth', 'basics', 'fundamentals'],
    createdAt: '2024-01-09T10:00:00Z',
    videoUrl: 'https://example.com/video7.mp4'
  },
  {
    id: '8',
    title: 'Elite Training Methods',
    description: 'Professional-level training techniques used by elite players.',
    thumbnail: '/elite-hockey-training.png',
    duration: 1680,
    views: 11200,
    likes: 892,
    category: 'Elite',
    coach: {
      id: 'coach2',
      name: 'Sarah Williams',
      avatar: '/female-hockey-coach-headshot.png'
    },
    tags: ['elite', 'professional', 'advanced'],
    createdAt: '2024-01-08T10:00:00Z',
    videoUrl: 'https://example.com/video8.mp4'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: VideoFilters = {
      category: searchParams.get('category') || undefined,
      coach: searchParams.get('coach') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'newest',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12')
    }

    // Filter videos
    let filteredVideos = [...mockVideos]

    if (filters.category) {
      filteredVideos = filteredVideos.filter(video => 
        video.category.toLowerCase() === filters.category!.toLowerCase()
      )
    }

    if (filters.coach) {
      filteredVideos = filteredVideos.filter(video => 
        video.coach.name.toLowerCase().includes(filters.coach!.toLowerCase())
      )
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredVideos = filteredVideos.filter(video => 
        video.title.toLowerCase().includes(searchTerm) ||
        video.description.toLowerCase().includes(searchTerm) ||
        video.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    // Sort videos
    switch (filters.sortBy) {
      case 'popular':
        filteredVideos.sort((a, b) => b.views - a.views)
        break
      case 'duration':
        filteredVideos.sort((a, b) => a.duration - b.duration)
        break
      case 'newest':
      default:
        filteredVideos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    // Paginate
    const page = filters.page || 1
    const limit = filters.limit || 12
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedVideos = filteredVideos.slice(startIndex, endIndex)

    const response: PaginatedResponse<Video> = {
      data: paginatedVideos,
      pagination: {
        page,
        limit,
        total: filteredVideos.length,
        totalPages: Math.ceil(filteredVideos.length / limit),
        hasNext: endIndex < filteredVideos.length,
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
