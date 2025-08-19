import { type NextRequest, NextResponse } from "next/server"

const mockVideos = [
  {
    id: "1",
    title: "Advanced Ball Control Techniques",
    description: "Master advanced ball control skills used by professional field hockey players.",
    videoUrl: "https://example.com/videos/ball-control-advanced.mp4",
    thumbnail: "/field-hockey-player-controlling-ball.png",
    duration: 1245,
    category: "1",
    difficulty: "advanced",
    status: "published",
    coach: {
      id: "coach1",
      name: "Emma Thompson",
      avatar: "/female-hockey-coach-headshot.png",
    },
    tags: ["ball-control", "advanced", "technique"],
    views: 15420,
    likes: 892,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    title: "Precision Passing Fundamentals",
    description: "Learn the fundamentals of accurate passing in field hockey.",
    videoUrl: "https://example.com/videos/passing-fundamentals.mp4",
    thumbnail: "/field-hockey-pass.png",
    duration: 980,
    category: "2",
    difficulty: "beginner",
    status: "published",
    coach: {
      id: "coach2",
      name: "James Wilson",
      avatar: "/hockey-coach-headshot.png",
    },
    tags: ["passing", "fundamentals", "accuracy"],
    views: 12350,
    likes: 654,
    createdAt: "2024-01-14T10:00:00Z",
  },
  {
    id: "3",
    title: "Defensive Positioning Strategies",
    description: "Master defensive positioning and tackling techniques.",
    videoUrl: "https://example.com/videos/defense-positioning.mp4",
    thumbnail: "/field-hockey-defense.png",
    duration: 1560,
    category: "3",
    difficulty: "intermediate",
    status: "published",
    coach: {
      id: "coach3",
      name: "Sarah Martinez",
      avatar: "/female-hockey-coach-headshot.png",
    },
    tags: ["defense", "positioning", "tactics"],
    views: 8920,
    likes: 445,
    createdAt: "2024-01-13T10:00:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const difficulty = searchParams.get("difficulty") || "all"
    const status = searchParams.get("status") || "all"
    const minDuration = Number.parseInt(searchParams.get("minDuration") || "0")
    const maxDuration = Number.parseInt(searchParams.get("maxDuration") || "999999")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "9")

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 450))

    let filteredVideos = [...mockVideos]

    // Apply filters
    if (search) {
      const searchTerm = search.toLowerCase()
      filteredVideos = filteredVideos.filter(
        (video) =>
          video.title.toLowerCase().includes(searchTerm) ||
          video.description.toLowerCase().includes(searchTerm) ||
          video.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
      )
    }

    if (category) {
      filteredVideos = filteredVideos.filter((video) => video.category === category)
    }

    if (difficulty !== "all") {
      filteredVideos = filteredVideos.filter((video) => video.difficulty === difficulty)
    }

    if (status !== "all") {
      filteredVideos = filteredVideos.filter((video) => video.status === status)
    }

    filteredVideos = filteredVideos.filter((video) => video.duration >= minDuration && video.duration <= maxDuration)

    // Paginate
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedVideos = filteredVideos.slice(startIndex, endIndex)

    return NextResponse.json({
      items: paginatedVideos,
      page,
      totalPages: Math.ceil(filteredVideos.length / limit),
      totalItems: filteredVideos.length,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
