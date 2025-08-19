import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

const mockVideos = [
  {
    id: "1",
    title: "Advanced Ball Control Techniques",
    description: "Master advanced ball control skills used by professional field hockey players.",
    videoUrl: "https://example.com/videos/ball-control-advanced.mp4",
    thumbnail: "/field-hockey-player-controlling-ball.png",
    duration: 1245,
    category: "1", // Ball Control
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
    category: "2", // Passing
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
    category: "3", // Defense
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
  {
    id: "4",
    title: "Speed and Agility Training",
    description: "Improve your speed and agility with these field hockey specific drills.",
    videoUrl: "https://example.com/videos/speed-agility.mp4",
    thumbnail: "/field-hockey-drills.png",
    duration: 720,
    category: "4", // Movement
    coach: {
      id: "coach1",
      name: "Emma Thompson",
      avatar: "/female-hockey-coach-headshot.png",
    },
    tags: ["speed", "agility", "fitness"],
    views: 18750,
    likes: 1205,
    createdAt: "2024-01-12T10:00:00Z",
  },
  {
    id: "5",
    title: "Team Coordination Drills",
    description: "Learn team coordination and communication strategies.",
    videoUrl: "https://example.com/videos/team-coordination.mp4",
    thumbnail: "/field-hockey-training.png",
    duration: 1120,
    category: "5", // Team Training
    coach: {
      id: "coach2",
      name: "James Wilson",
      avatar: "/hockey-coach-headshot.png",
    },
    tags: ["teamwork", "coordination", "communication"],
    views: 14200,
    likes: 780,
    createdAt: "2024-01-11T10:00:00Z",
  },
  {
    id: "6",
    title: "Penalty Corner Execution",
    description: "Master penalty corner techniques and set piece strategies.",
    videoUrl: "https://example.com/videos/penalty-corners.mp4",
    thumbnail: "/field-hockey-penalty-corner.png",
    duration: 890,
    category: "6", // Set Pieces
    coach: {
      id: "coach3",
      name: "Sarah Martinez",
      avatar: "/female-hockey-coach-headshot.png",
    },
    tags: ["penalty-corner", "set-pieces", "strategy"],
    views: 9650,
    likes: 523,
    createdAt: "2024-01-10T10:00:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "9")

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const accessToken = (token as any)?.accessToken as string | undefined

    // Try to fetch from external API first
    try {
      const externalResponse = await fetch(`${process.env.LEAD_BACKEND}/api/v1/videos`, {
        headers: {
          accept: "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      })

      if (externalResponse.ok) {
        const externalData = await externalResponse.json()

        // Handle pagination for external data
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedVideos = externalData.slice(startIndex, endIndex)

        return NextResponse.json({
          items: paginatedVideos,
          page,
          totalPages: Math.ceil(externalData.length / limit),
        })
      }
    } catch (externalError) {
      console.log("External API failed, falling back to mock data")
    }

    // Fallback to mock data if external API fails
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedVideos = mockVideos.slice(startIndex, endIndex)

    return NextResponse.json({
      items: paginatedVideos,
      page,
      totalPages: Math.ceil(mockVideos.length / limit),
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    const newVideo = {
      id: Date.now().toString(),
      ...body,
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
    }

    mockVideos.push(newVideo)

    return NextResponse.json(newVideo, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
