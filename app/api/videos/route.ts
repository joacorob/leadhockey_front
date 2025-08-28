import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

// GET /api/videos – proxy to backend API without local mock data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Retrieve access token from NextAuth session (if available)
    const session = await getServerSession(authOptions)
    const accessToken: string | undefined = (session as any)?.accessToken

    // Build external URL, preserving query parameters
    const externalUrl = new URL(`${process.env.LEAD_BACKEND}/api/v1/videos`)
    searchParams.forEach((value, key) => {
      externalUrl.searchParams.append(key, value)
    })

    // Forward request to external backend
    const externalResponse = await fetch(externalUrl.toString(), {
      headers: {
        accept: "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })

    const data = await externalResponse.json()

    if (externalResponse.ok) {
      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json({ success: false, error: data?.message || "Failed to fetch videos" }, { status: externalResponse.status })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
