import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const BASE_URL = `${process.env.LEAD_BACKEND}/api/v1/practice-plans`

async function getAccessToken() {
  const session = await getServerSession(authOptions)
  return (session as any)?.accessToken as string | undefined
}

export async function GET(request: NextRequest) {
  try {
    const token = await getAccessToken()
    const { searchParams } = new URL(request.url)
    const url = new URL(BASE_URL)
    searchParams.forEach((v, k) => url.searchParams.append(k, v))

    const backendRes = await fetch(url.toString(), {
      headers: {
        accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    const data = await backendRes.json()
    return NextResponse.json(data, { status: backendRes.status })
  } catch (e) {
    console.error("practice-plans proxy GET error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getAccessToken()
    const body = await request.text()

    const backendRes = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
    })

    const data = await backendRes.json()
    return NextResponse.json(data, { status: backendRes.status })
  } catch (e) {
    console.error("practice-plans proxy POST error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
