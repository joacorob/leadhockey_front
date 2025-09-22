import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

// POST /api/drills – proxy to backend API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const accessToken: string | undefined = (session as any)?.accessToken

    const body = await request.text()
    const backendUrl = `${process.env.LEAD_BACKEND}/api/v1/drills`

    const externalResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body,
    })

    const data = await externalResponse.json()

    return NextResponse.json(data, { status: externalResponse.status })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
