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

// GET /api/drills – proxy list drills from backend
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const accessToken: string | undefined = (session as any)?.accessToken

    const { searchParams } = new URL(request.url)
    const externalUrl = new URL(`${process.env.LEAD_BACKEND}/api/v1/drills`)
    searchParams.forEach((v, k) => externalUrl.searchParams.append(k, v))

    const externalResponse = await fetch(externalUrl.toString(), {
      headers: {
        accept: "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })
    const data = await externalResponse.json()
    console.log(JSON.stringify(data, null, 2))
    return NextResponse.json(data, { status: externalResponse.status })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
