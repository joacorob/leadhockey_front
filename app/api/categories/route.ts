import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

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
      const externalResponse = await fetch(`${process.env.LEAD_BACKEND}/api/v1/categories`, {
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

    // If external API fails, forward the error
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 502 })
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

    // Forward create request to backend API
    const session = await getServerSession(authOptions)
    const accessToken: string | undefined = (session as any)?.accessToken

    const externalResponse = await fetch(`${process.env.LEAD_BACKEND}/api/v1/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ name, description, color, icon }),
    })

    const data = await externalResponse.json()

    if (externalResponse.ok) {
      return NextResponse.json({ success: true, data }, { status: 201 })
    }

    return NextResponse.json({ success: false, error: data?.message || "Failed to create category" }, { status: externalResponse.status })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
