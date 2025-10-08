import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/me/watched - Obtener historial de videos/drills completados
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const accessToken: string | undefined = (session as any)?.accessToken

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "1"
    const limit = searchParams.get("limit") || "20"

    const response = await fetch(
      `${process.env.LEAD_BACKEND}/api/v1/me/watched?page=${page}&limit=${limit}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    }

    return NextResponse.json(
      { success: false, error: data?.message || "Failed to fetch watch history" },
      { status: response.status }
    )
  } catch (error) {
    console.error("Error fetching watch history:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

