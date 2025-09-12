import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

// GET /api/filters – proxy to backend API, expects categoryId query param
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")

    // Retrieve access token from NextAuth session (if available)
    const session = await getServerSession(authOptions)
    const accessToken: string | undefined = (session as any)?.accessToken

    const externalUrl = new URL(`${process.env.LEAD_BACKEND}/api/v1/filters`)
    if (categoryId) {
      externalUrl.searchParams.set("categoryId", categoryId)
    }

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

    return NextResponse.json(
      { success: false, error: data?.message || "Failed to fetch filters" },
      { status: externalResponse.status },
    )
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
