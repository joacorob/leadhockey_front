import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

// Mock categories database matching OpenAPI specification
const mockCategories = [
  {
    id: "1",
    name: "Ball Control",
    description: "Master ball control techniques and stick handling skills",
    color: "#10B981",
    icon: "ball-control",
  },
  {
    id: "2",
    name: "Passing",
    description: "Learn accurate passing techniques and field vision",
    color: "#3B82F6",
    icon: "passing",
  },
  {
    id: "3",
    name: "Defense",
    description: "Defensive positioning and tackling strategies",
    color: "#EF4444",
    icon: "defense",
  },
  {
    id: "4",
    name: "Movement",
    description: "Improve speed, agility and field positioning",
    color: "#F59E0B",
    icon: "movement",
  },
  {
    id: "5",
    name: "Team Training",
    description: "Team tactics and coordinated play strategies",
    color: "#8B5CF6",
    icon: "team",
  },
  {
    id: "6",
    name: "Set Pieces",
    description: "Penalty corners, free hits and set piece execution",
    color: "#06B6D4",
    icon: "set-pieces",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    // Extract access token from NextAuth session (if exists)
    const session = await getServerSession(authOptions)
    console.log("session", session)
    const accessToken: any = (session as any)?.accessToken

    console.log("accessToken", accessToken)

    // Try to fetch from external API first
    try {
      const externalResponse = await fetch(`${process.env.LEAD_BACKEND}/api/categories`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (externalResponse.ok) {
        const externalData = await externalResponse.json()

        // Apply search filter if provided
        let filteredCategories = externalData
        if (search) {
          const searchTerm = search.toLowerCase()
          filteredCategories = externalData.filter(
            (category: any) =>
              category.name.toLowerCase().includes(searchTerm) ||
              (category.description && category.description.toLowerCase().includes(searchTerm)),
          )
        }

        return NextResponse.json({ success: true, data: filteredCategories })
      }
    } catch (externalError) {
      console.log("External API failed, falling back to mock data")
    }

    // Fallback to mock data if external API fails
    const mockCategoriesData = [
      {
        id: "1",
        name: "Ball Control",
        description: "Master ball control techniques and stick handling skills",
        color: "#10B981",
        icon: "ball-control",
      },
      {
        id: "2",
        name: "Passing",
        description: "Learn accurate passing techniques and field vision",
        color: "#3B82F6",
        icon: "passing",
      },
      {
        id: "3",
        name: "Defense",
        description: "Defensive positioning and tackling strategies",
        color: "#EF4444",
        icon: "defense",
      },
      {
        id: "4",
        name: "Movement",
        description: "Improve speed, agility and field positioning",
        color: "#F59E0B",
        icon: "movement",
      },
      {
        id: "5",
        name: "Team Training",
        description: "Team tactics and coordinated play strategies",
        color: "#8B5CF6",
        icon: "team",
      },
      {
        id: "6",
        name: "Set Pieces",
        description: "Penalty corners, free hits and set piece execution",
        color: "#06B6D4",
        icon: "set-pieces",
      },
    ]

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    let filteredCategories = [...mockCategoriesData]

    if (search) {
      const searchTerm = search.toLowerCase()
      filteredCategories = filteredCategories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm) || category.description.toLowerCase().includes(searchTerm),
      )
    }

    return NextResponse.json({ success: true, data: filteredCategories })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color, icon } = body

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 })
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newCategory = {
      id: Date.now().toString(),
      name,
      description: description || "",
      color: color || "#6B7280",
      icon: icon || "default",
    }

    mockCategories.push(newCategory)

    return NextResponse.json({ success: true, data: newCategory }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
