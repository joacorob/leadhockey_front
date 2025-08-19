import { type NextRequest, NextResponse } from "next/server"

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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const categoryId = params.id

    // Simulate database lookup delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    const category = mockCategories.find((c) => c.id === categoryId)

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const categoryId = params.id
    const body = await request.json()

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 400))

    const categoryIndex = mockCategories.findIndex((c) => c.id === categoryId)

    if (categoryIndex === -1) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    mockCategories[categoryIndex] = {
      ...mockCategories[categoryIndex],
      ...body,
    }

    return NextResponse.json(mockCategories[categoryIndex])
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const categoryId = params.id

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const categoryIndex = mockCategories.findIndex((c) => c.id === categoryId)

    if (categoryIndex === -1) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    mockCategories.splice(categoryIndex, 1)

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
