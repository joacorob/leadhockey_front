import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    const accessToken: string | undefined = (session as any)?.accessToken

    const externalResponse = await fetch(`${process.env.LEAD_BACKEND}/api/v1/playlists/2`, {
      headers: {
        accept: "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })

    const data = await externalResponse.json()


    if (externalResponse.ok) {
      return NextResponse.json({ success: true, data: data.data ?? data })
    }

    return NextResponse.json({ success: false, error: data?.message || "Failed to fetch playlists" }, { status: externalResponse.status })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message, "error")
    } else {
      console.error("Unknown error", error)
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// If you need PUT/UPDATE, forward similarly to the backend API.
