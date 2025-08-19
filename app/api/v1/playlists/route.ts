import { type NextRequest, NextResponse } from "next/server"

const mockPlaylists = [
  {
    id: "p1",
    name: "Beginner Ball Control Series",
    description: "Complete series for mastering basic ball control techniques",
    thumbnail: "/field-hockey-player-controlling-ball.png",
    sessionIds: ["1", "4"],
    likesCount: 45,
    category: "Ball Control",
    difficulty: "beginner",
    estimatedDuration: 35, // minutes
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "p2",
    name: "Advanced Passing Masterclass",
    description: "Advanced passing techniques and field vision training",
    thumbnail: "/field-hockey-pass.png",
    sessionIds: ["2", "5"],
    likesCount: 78,
    category: "Passing",
    difficulty: "advanced",
    estimatedDuration: 52,
    createdAt: "2024-01-14T10:00:00Z",
  },
  {
    id: "p3",
    name: "Defensive Fundamentals",
    description: "Essential defensive skills every player needs",
    thumbnail: "/field-hockey-defense.png",
    sessionIds: ["3"],
    likesCount: 32,
    category: "Defense",
    difficulty: "intermediate",
    estimatedDuration: 26,
    createdAt: "2024-01-13T10:00:00Z",
  },
  {
    id: "p4",
    name: "Set Piece Mastery",
    description: "Complete guide to penalty corners and set pieces",
    thumbnail: "/field-hockey-penalty-corner.png",
    sessionIds: ["6"],
    likesCount: 67,
    category: "Set Pieces",
    difficulty: "advanced",
    estimatedDuration: 15,
    createdAt: "2024-01-12T10:00:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 350))

    // Paginate
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPlaylists = mockPlaylists.slice(startIndex, endIndex)

    return NextResponse.json({
      items: paginatedPlaylists,
      page,
      totalPages: Math.ceil(mockPlaylists.length / limit),
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newPlaylist = {
      id: `p${Date.now()}`,
      ...body,
      likesCount: 0,
      createdAt: new Date().toISOString(),
    }

    mockPlaylists.push(newPlaylist)

    return NextResponse.json(newPlaylist, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
