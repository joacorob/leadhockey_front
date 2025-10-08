import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/playlists/latest - Fetch playlist with ID=4 (Latest videos)
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const accessToken: string | undefined = (session as any)?.accessToken

    // Hardcoded playlist ID = 4 for "Latest" videos
    const LATEST_PLAYLIST_ID = 4

    const response = await fetch(
      `${process.env.LEAD_BACKEND}/api/v1/playlists/${LATEST_PLAYLIST_ID}`,
      {
        headers: {
          accept: "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      }
    )

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json({ success: true, data: data.data ?? data })
    }

    return NextResponse.json(
      { success: false, error: data?.message || "Failed to fetch latest playlist" },
      { status: response.status }
    )
  } catch (error) {
    console.error("Error fetching latest playlist:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

