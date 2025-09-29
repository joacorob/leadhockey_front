import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const BASE_URL = `${process.env.LEAD_BACKEND}/api/v1/practice-plans`

async function getAccessToken() {
  const session = await getServerSession(authOptions)
  return (session as any)?.accessToken as string | undefined
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getAccessToken()
    const body = await request.text()
    const url = `${BASE_URL}/${params.id}`

    const backendRes = await fetch(url, {
      method: "PATCH",
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
    console.error("practice-plans proxy PATCH error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
